/**
 * Zod schemas for all Stripe-related API payloads.
 * Shared between routes and tests for type safety.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export const CheckoutRequestSchema = z.object({
  artworkId: z.string().uuid(),
  artistId: z.string().uuid(),
  djId: z.string().uuid().optional(),
  priceCents: z.number().int().positive(),
  title: z.string().min(1).max(200),
  imageUrl: z.string().url().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  platformFeeCents: z.number().int().nonnegative().default(0),
  orderId: z.string().uuid(),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

// ---------------------------------------------------------------------------
// Revenue Split
// ---------------------------------------------------------------------------

export const RevenueSplitSchema = z
  .object({
    artistCents: z.number().int().nonnegative(),
    djCents: z.number().int().nonnegative(),
    platformCents: z.number().int().nonnegative(),
    totalCents: z.number().int().positive(),
  })
  .refine(
    (data) => data.artistCents + data.djCents + data.platformCents === data.totalCents,
    {
      message: "Split sums must equal total",
      path: ["totalCents"],
    },
  );

export type RevenueSplit = z.infer<typeof RevenueSplitSchema>;

// ---------------------------------------------------------------------------
// Webhook Events (subset we handle)
// ---------------------------------------------------------------------------

export const WebhookEventTypeSchema = z.enum([
  "account.updated",
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
]);

export type WebhookEventType = z.infer<typeof WebhookEventTypeSchema>;

// ---------------------------------------------------------------------------
// Order Update from Webhook
// ---------------------------------------------------------------------------

export const OrderUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "processing", "paid", "refunded", "disputed", "failed"]),
  stripePaymentIntentId: z.string().optional(),
  stripeChargeId: z.string().optional(),
});

export type OrderUpdate = z.infer<typeof OrderUpdateSchema>;

// ---------------------------------------------------------------------------
// Connect Onboarding
// ---------------------------------------------------------------------------

export const ConnectOnboardRequestSchema = z.object({
  role: z.enum(["artist", "dj"]),
  refreshUrl: z.string().url(),
  returnUrl: z.string().url(),
});

export type ConnectOnboardRequest = z.infer<typeof ConnectOnboardRequestSchema>;

export const ConnectOnboardResponseSchema = z.object({
  url: z.string().url(),
  accountId: z.string(),
});

export type ConnectOnboardResponse = z.infer<typeof ConnectOnboardResponseSchema>;

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

/** Validate Stripe Payment Intent ID format (pi_xxxxxxxxxxxxxxxx) */
export function isValidPaymentIntentId(id: string): boolean {
  return typeof id === "string" && id.startsWith("pi_") && id.length > 10;
}
