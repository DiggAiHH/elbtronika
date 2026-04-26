// Stripe webhook handler — idempotent, verifies signature
// Eselbrücke: "mailroom" — receives Stripe events, logs + routes to DB
// Handles: account.updated (KYC complete → payout_enabled)

import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/src/lib/supabase/server";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret)
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
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

  if (existing) return NextResponse.json({ status: "already_processed" });

  // Log event — cast to Json via JSON round-trip
  await supabase.from("webhook_events").insert({
    source: "stripe" as const,
    event_type: event.type,
    stripe_event_id: event.id,
    payload: JSON.parse(JSON.stringify(event)) as Record<string, never>,
  });

  try {
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const payoutEnabled =
        account.payouts_enabled === true &&
        account.charges_enabled === true &&
        account.details_submitted === true;

      const userId = account.metadata?.elbtronika_user_id;
      const role = account.metadata?.elbtronika_role;

      if (userId && role) {
        const table = role === "artist" ? "artists" : "djs";
        await supabase
          .from(table)
          .update({ stripe_account_id: account.id, payout_enabled: payoutEnabled })
          .eq("profile_id", userId);
      }
    }

    await supabase
      .from("webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    await supabase
      .from("webhook_events")
      .update({ error: String(err) })
      .eq("stripe_event_id", event.id);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
