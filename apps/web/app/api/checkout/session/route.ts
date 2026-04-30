// Checkout Session — creates Stripe Checkout for artwork purchase
// Eselbrücke: "Die Kasse" — Kunde klickt "Acquire", Stripe übernimmt Bezahlung

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import {
  CheckoutRequestSchema,
  createCheckoutSession,
  computeRevenueSplit,
} from "@elbtronika/payments";

// ---------------------------------------------------------------------------
// POST /api/checkout/session
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CheckoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const req = parsed.data;

  // Fetch artwork + artist stripe account
  const { data: artwork } = await supabase
    .from("artworks")
    .select("id, title, artist_id, set_id, price_eur, image_url")
    .eq("id", req.artworkId)
    .single();

  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  // Verify price matches (anti-tampering)
  if (artwork.price_eur * 100 !== req.priceCents) {
    return NextResponse.json(
      { error: "Price mismatch" },
      { status: 422 },
    );
  }

  // Get artist Stripe account
  const { data: artist } = await supabase
    .from("artists")
    .select("stripe_account_id, payout_enabled")
    .eq("id", artwork.artist_id)
    .single();

  if (!artist?.stripe_account_id || !artist.payout_enabled) {
    return NextResponse.json(
      { error: "Artist not ready for payouts" },
      { status: 422 },
    );
  }

  // Get DJ Stripe account if applicable
  let djAccountId: string | undefined;
  if (artwork.set_id) {
    const { data: set } = await supabase
      .from("sets")
      .select("dj_id")
      .eq("id", artwork.set_id)
      .single();

    if (set?.dj_id) {
      const { data: dj } = await supabase
        .from("djs")
        .select("stripe_account_id, payout_enabled")
        .eq("id", set.dj_id)
        .single();

      if (dj?.stripe_account_id && dj.payout_enabled) {
        djAccountId = dj.stripe_account_id;
      }
    }
  }

  // Compute split
  const split = computeRevenueSplit(req.priceCents, !!djAccountId);

  // Create pending order in Supabase
  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        artwork_id: req.artworkId,
        buyer_id: user.id,
        amount_eur: req.priceCents / 100,
        artist_payout_eur: split.artistCents / 100,
        dj_payout_eur: split.djCents / 100,
        platform_fee_eur: split.platformCents / 100,
        status: "pending",
        stripe_payment_intent_id: null,
        stripe_charge_id: null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[checkout] order creation failed:", orderError?.message);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    // Create Stripe Checkout Session with order ID for tracking
    const session = await createCheckoutSession({
      artworkId: req.artworkId,
      artistStripeAccountId: artist.stripe_account_id,
      ...(djAccountId ? { djStripeAccountId: djAccountId } : {}),
      priceCents: req.priceCents,
      title: artwork.title,
      imageUrl: artwork.image_url ?? undefined,
      successUrl: req.successUrl,
      cancelUrl: req.cancelUrl,
      platformFeeCents: split.platformCents,
      orderId: order.id,
      ...(user.email ? { buyerEmail: user.email } : {}),
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout] Stripe error:", message);
    return NextResponse.json(
      { error: "Payment provider error" },
      { status: 500 },
    );
  }
}
