/**
 * Revenue split calculation and Stripe transfer creation.
 * ELBTRONIKA split: 60% artist, 20% DJ (if applicable), 20% platform.
 */

import type Stripe from "stripe";
import { getStripe } from "./client";
import type { RevenueSplit } from "./schemas";

const ARTIST_SHARE = 0.6;
const DJ_SHARE = 0.2;
const CURRENCY = "eur" as const;

export function computeRevenueSplit(
  totalCents: number,
  hasDj: boolean,
): RevenueSplit {
  const artistCents = Math.floor(totalCents * ARTIST_SHARE);
  const djCents = hasDj ? Math.floor(totalCents * DJ_SHARE) : 0;
  // Platform gets the remainder to avoid rounding errors
  const platformCents = totalCents - artistCents - djCents;

  return {
    artistCents,
    djCents,
    platformCents,
    totalCents,
  };
}

export interface TransferParams {
  paymentIntentId: string;
  artistAccountId: string;
  artistAmountCents: number;
  djAccountId?: string | undefined;
  djAmountCents?: number | undefined;
  orderId: string;
}

/**
 * Create Stripe transfers for artist + optional DJ.
 * Must be called AFTER the PaymentIntent is captured.
 */
export async function createTransfers(
  params: TransferParams,
): Promise<{ artistTransfer: Stripe.Transfer; djTransfer: Stripe.Transfer | undefined }> {
  const stripe = getStripe();

  // Idempotency keys prevent duplicate transfers on retries
  const artistIdempotencyKey = `transfer_artist_${params.orderId}_${params.artistAmountCents}`;

  const artistPromise = stripe.transfers.create(
    {
      amount: params.artistAmountCents,
      currency: CURRENCY,
      destination: params.artistAccountId,
      source_transaction: params.paymentIntentId,
      metadata: { elbtronika_type: "artist_payout" },
    },
    { idempotencyKey: artistIdempotencyKey },
  );

  const djPromise =
    params.djAccountId && params.djAmountCents && params.djAmountCents > 0
      ? stripe.transfers.create(
          {
            amount: params.djAmountCents,
            currency: CURRENCY,
            destination: params.djAccountId,
            source_transaction: params.paymentIntentId,
            metadata: { elbtronika_type: "dj_payout" },
          },
          {
            idempotencyKey: `transfer_dj_${params.orderId}_${params.djAmountCents}`,
          },
        )
      : Promise.resolve(undefined);

  const [artistTransfer, djTransfer] = await Promise.all([artistPromise, djPromise]);

  return { artistTransfer, djTransfer };
}

/**
 * Create a Stripe Checkout Session for an artwork purchase.
 */
export interface CheckoutSessionParams {
  artworkId: string;
  artistStripeAccountId: string;
  djStripeAccountId?: string | undefined;
  priceCents: number;
  title: string;
  imageUrl?: string | undefined;
  successUrl: string;
  cancelUrl: string;
  platformFeeCents: number;
  buyerEmail?: string | undefined;
  orderId: string;
}

export async function createCheckoutSession(
  params: CheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  const lineItems: Array<{
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: {
        name: string;
        images?: string[];
        metadata?: Record<string, string>;
      };
    };
    quantity: number;
  }> = [
    {
      price_data: {
        currency: "eur",
        unit_amount: params.priceCents,
        product_data: {
          name: params.title,
          ...(params.imageUrl ? { images: [params.imageUrl] } : {}),
          metadata: {
            artwork_id: params.artworkId,
            order_id: params.orderId,
          },
        },
      },
      quantity: 1,
    },
  ];

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    payment_intent_data: {
      transfer_group: `artwork_${params.artworkId}`,
      metadata: {
        artwork_id: params.artworkId,
        artist_account: params.artistStripeAccountId,
        ...(params.djStripeAccountId
          ? { dj_account: params.djStripeAccountId }
          : {}),
      },
    },
    metadata: {
      artwork_id: params.artworkId,
      artist_account: params.artistStripeAccountId,
      ...(params.djStripeAccountId
        ? { dj_account: params.djStripeAccountId }
        : {}),
    },
    // Platform fee for Stripe Connect
    ...(params.platformFeeCents > 0
      ? { application_fee_amount: params.platformFeeCents }
      : {}),
    // Link Stripe session to internal order
    client_reference_id: params.orderId,
    ...(params.buyerEmail ? { customer_email: params.buyerEmail } : {}),
  };

  const idempotencyKey = `checkout_${params.orderId}_${params.artworkId}`;

  return stripe.checkout.sessions.create(sessionParams, { idempotencyKey });
}
