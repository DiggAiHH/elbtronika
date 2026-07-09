/**
 * Stripe webhook event handlers.
 * Pure logic — no HTTP framework coupling. Can be used in Next.js, Edge Functions, etc.
 */

import { computeRevenueSplit, createTransfers } from "./transfers";

export interface WebhookContext {
  updateOrder: (params: {
    orderId: string;
    status: "pending" | "processing" | "paid" | "refunded" | "disputed" | "failed";
    stripePaymentIntentId?: string;
    stripeChargeId?: string;
  }) => Promise<void>;

  getOrderBySessionId: (sessionId: string) => Promise<{
    id: string;
    artwork_id: string;
    buyer_id: string;
    artist_payout_eur: number;
    dj_payout_eur: number;
    status: string;
  } | null>;

  getArtistStripeAccount: (artworkId: string) => Promise<string | null>;
  getDjStripeAccount: (artworkId: string) => Promise<string | null>;
}

export async function handleCheckoutSessionCompleted(
  session: unknown,
  ctx: WebhookContext,
): Promise<void> {
  const s = session as { id: string; payment_intent: string | null };
  const order = await ctx.getOrderBySessionId(s.id);
  if (!order) {
    console.warn(`[webhook] No order found for session ${s.id}`);
    return;
  }

  const paymentIntentId = s.payment_intent ?? undefined;

  if (paymentIntentId) {
    await ctx.updateOrder({
      orderId: order.id,
      status: "processing",
      stripePaymentIntentId: paymentIntentId,
    });
  } else {
    await ctx.updateOrder({
      orderId: order.id,
      status: "processing",
    });
  }
}

export async function handlePaymentIntentSucceeded(
  paymentIntent: unknown,
  ctx: WebhookContext,
): Promise<void> {
  const pi = paymentIntent as { metadata?: Record<string, string>; amount: number; id: string };
  const artworkId = pi.metadata?.artwork_id;
  if (!artworkId) {
    console.warn("[webhook] No artwork_id in payment_intent metadata");
    return;
  }

  // order_id scopes the transfer idempotency keys. NO fallback to artwork_id:
  // with editions, a second sale of the same artwork at the same price would
  // silently reuse the first sale's idempotency key and Stripe would swallow
  // the artist's second payout. Better to fail loudly and retry after fixing.
  const orderId = pi.metadata?.order_id;
  if (!orderId) {
    console.error(
      `[webhook] payment_intent ${pi.id} has no order_id in metadata — refusing to create transfers (idempotency would collide across orders)`,
    );
    throw new Error(`Missing order_id metadata on payment_intent ${pi.id}`);
  }

  const artistAccountId = await ctx.getArtistStripeAccount(artworkId);
  if (!artistAccountId) {
    console.warn(`[webhook] No Stripe account for artwork ${artworkId}`);
    return;
  }

  const djAccountId = await ctx.getDjStripeAccount(artworkId);
  const amountCents = pi.amount;
  const split = computeRevenueSplit(amountCents, !!djAccountId);

  try {
    await createTransfers({
      paymentIntentId: pi.id,
      artistAccountId,
      artistAmountCents: split.artistCents,
      djAccountId: djAccountId ?? undefined,
      djAmountCents: djAccountId ? split.djCents : undefined,
      orderId,
    });

    console.log(`[webhook] Transfers created for payment ${pi.id}`);
  } catch (err) {
    console.error("[webhook] Transfer failed:", err);
    throw err;
  }
}

export async function handlePaymentIntentFailed(
  paymentIntent: unknown,
  ctx: WebhookContext,
): Promise<void> {
  const pi = paymentIntent as { metadata?: Record<string, string> };
  const sessionId = pi.metadata?.checkout_session_id;
  if (!sessionId) return;

  const order = await ctx.getOrderBySessionId(sessionId);
  if (!order) return;

  await ctx.updateOrder({
    orderId: order.id,
    status: "failed",
  });
}

export async function handleAccountUpdated(
  account: unknown,
): Promise<{ userId: string; role: string; payoutEnabled: boolean } | null> {
  const acc = account as {
    metadata?: Record<string, string>;
    payouts_enabled?: boolean;
    charges_enabled?: boolean;
    details_submitted?: boolean;
  };

  const userId = acc.metadata?.elbtronika_user_id;
  const role = acc.metadata?.elbtronika_role;

  if (!userId || !role) return null;

  const payoutEnabled =
    acc.payouts_enabled === true && acc.charges_enabled === true && acc.details_submitted === true;

  return { userId, role, payoutEnabled };
}
