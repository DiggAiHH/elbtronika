import { z } from "zod";

export const OrderStatusSchema = z.enum([
  "pending",
  "processing",
  "paid",
  "refunded",
  "disputed",
  "failed",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  collectorId: z.string().uuid(), // FK → profiles.id
  artworkId: z.string().uuid(),
  artistId: z.string().uuid(),
  djId: z.string().uuid().optional(),

  // Stripe references
  stripeSessionId: z.string(),
  stripePaymentIntentId: z.string().optional(),
  stripeTransferArtistId: z.string().optional(),
  stripeTransferDjId: z.string().optional(),

  // Financials – always EUR cents
  amountTotalCents: z.number().int().nonnegative(),
  artistShareCents: z.number().int().nonnegative(), // 60%
  djShareCents: z.number().int().nonnegative(), // 20% (0 if no DJ)
  platformShareCents: z.number().int().nonnegative(), // 20%

  status: OrderStatusSchema,

  // Digital delivery
  downloadToken: z.string().optional(), // One-time signed token for exclusive set
  downloadTokenExpiresAt: z.string().datetime().optional(),

  // Shipping (physical original)
  shippingName: z.string().optional(),
  shippingAddressLine1: z.string().optional(),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountryCode: z.string().length(2).optional(),
  shippedAt: z.string().datetime().optional(),
  trackingCode: z.string().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Order = z.infer<typeof OrderSchema>;

/** Computed from Stripe webhook – validates the 60/20/20 split */
export function computeRevenueSplit(
  totalCents: number,
  hasDj: boolean,
): { artist: number; dj: number; platform: number } {
  const artist = Math.floor(totalCents * 0.6);
  const dj = hasDj ? Math.floor(totalCents * 0.2) : 0;
  const platform = totalCents - artist - dj;
  return { artist, dj, platform };
}
