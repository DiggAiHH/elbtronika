/**
 * Revenue split calculation and Stripe transfer creation.
 * ELBTRONIKA split: 60% artist, 20% DJ (if applicable), 20% platform.
 */

import type Stripe from "stripe";
import { getStripe } from "./client";
import type { RevenueSplit } from "./schemas";

const ARTIST_SHARE = 0.6;
const DJ_SHARE = 0.2;

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
}

/**
 * Create Stripe transfers for artist + optional DJ.
 * Must be called AFTER the PaymentIntent is captured.
 */
export async function createTransfers(
  params: TransferParams,
): Promise<{ artistTransfer: Stripe.Transfer; djTransfer: Stripe.Transfer | undefined }> {
  const stripe = getStripe();

  const artistTransfer = await stripe.transfers.create({
    amount: params.artistAmountCents,
    currency: "eur",
    destination: params.artistAccountId,
    source_transaction: params.paymentIntentId,
    metadata: { elbtronika_type: "artist_payout" },
  });

  let djTransfer: Stripe.Transfer | undefined;
  if (params.djAccountId && params.djAmountCents && params.djAmountCents > 0) {
    djTransfer = await stripe.transfers.create({
      amount: params.djAmountCents,
      currency: "eur",
      destination: params.djAccountId,
      source_transaction: params.paymentIntentId,
      metadata: { elbtronika_type: "dj_payout" },
    });
  }

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
    ...(params.buyerEmail ? { customer_email: params.buyerEmail } : {}),
  };

  return stripe.checkout.sessions.create(sessionParams);
}
