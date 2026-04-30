// Stripe webhook handler — idempotent, verifies signature
// Eselbrücke: "mailroom" — receives Stripe events, logs + routes to DB
// Handles: account.updated, checkout.session.completed, payment_intent.succeeded

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import type { WebhookContext } from "@elbtronika/payments";
import {
  getStripe,
  getWebhookSecret,
  handleAccountUpdated,
  handleCheckoutSessionCompleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
} from "@elbtronika/payments";

// ---------------------------------------------------------------------------
// Shared Supabase-backed webhook context
// ---------------------------------------------------------------------------
function createWebhookContext(supabase: Awaited<ReturnType<typeof createClient>>): WebhookContext {
  return {
    updateOrder: async (params) => {
      await supabase
        .from("orders")
        .update({
          status: params.status,
          stripe_payment_intent_id: params.stripePaymentIntentId ?? null,
          stripe_charge_id: params.stripeChargeId ?? null,
        })
        .eq("id", params.orderId);
    },
    getOrderBySessionId: async (sessionId) => {
      const { data } = await supabase
        .from("orders")
        .select("id, artwork_id, buyer_id, artist_payout_eur, dj_payout_eur, status")
        .eq("stripe_payment_intent_id", sessionId)
        .maybeSingle();
      return data ?? null;
    },
    getArtistStripeAccount: async (artworkId) => {
      const { data } = await supabase
        .from("artworks")
        .select("artist_id, artists(stripe_account_id)")
        .eq("id", artworkId)
        .single();
      return (data?.artists as { stripe_account_id: string } | null)
        ?.stripe_account_id ?? null;
    },
    getDjStripeAccount: async (artworkId) => {
      const { data } = await supabase
        .from("artworks")
        .select("set_id, sets(dj_id, djs(stripe_account_id))")
        .eq("id", artworkId)
        .single();
      return (
        (data as unknown as { sets?: { dj_id: string; djs?: { stripe_account_id: string } } } | null)
          ?.sets?.djs?.stripe_account_id ?? null
      );
    },
  };
}

// ---------------------------------------------------------------------------
// POST /api/stripe/webhook
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret) as import("stripe").Stripe.Event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  // Idempotency check
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ status: "already_processed" });
  }

  // Log event
  await supabase.from("webhook_events").insert({
    source: "stripe",
    event_type: event.type,
    stripe_event_id: event.id,
    payload: JSON.parse(JSON.stringify(event)) as Record<string, never>,
  });

  const ctx = createWebhookContext(supabase);

  try {
    switch (event.type) {
      case "account.updated": {
        const result = await handleAccountUpdated(event.data.object);
        if (result) {
          const table = result.role === "artist" ? "artists" : "djs";
          await supabase
            .from(table)
            .update({
              stripe_account_id: (event.data.object as import("stripe").Stripe.Account).id,
              payout_enabled: result.payoutEnabled,
            })
            .eq("profile_id", result.userId);
        }
        break;
      }

      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(event.data.object, ctx);
        break;
      }

      case "payment_intent.succeeded": {
        await handlePaymentIntentSucceeded(event.data.object, ctx);

        // Mark order as paid
        const paymentIntent = event.data.object as import("stripe").Stripe.PaymentIntent;
        await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("stripe_payment_intent_id", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        await handlePaymentIntentFailed(event.data.object, ctx);
        break;
      }
    }

    await supabase
      .from("webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from("webhook_events")
      .update({ error: message })
      .eq("stripe_event_id", event.id);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
