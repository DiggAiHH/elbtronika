import { z } from "zod";

export const localizedStringSchema = z.object({
  de: z.string().min(1),
  en: z.string().optional(),
});

export const localizedTextSchema = z.object({
  de: z.string().optional(),
  en: z.string().optional(),
});

export const localizedPortableTextSchema = z.object({
  de: z.array(z.record(z.unknown())).default([]),
  en: z.array(z.record(z.unknown())).default([]),
});

export const profileRoleSchema = z.enum([
  "visitor",
  "collector",
  "artist",
  "dj",
  "curator",
  "admin",
]);
export const artworkStatusSchema = z.enum(["draft", "published", "sold", "archived"]);
export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "shipped",
  "delivered",
  "refunded",
  "failed",
]);
export const transactionKindSchema = z.enum(["charge", "transfer", "refund"]);
export const webhookSourceSchema = z.enum(["stripe", "sanity", "cloudflare"]);
export const aiDecisionTypeSchema = z.enum([
  "recommendation",
  "description",
  "moderation",
  "tagging",
]);

export const profileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1),
  portraitUrl: z.string().url().nullable().optional(),
  role: profileRoleSchema,
  countryCode: z.string().length(2).nullable().optional(),
  stripeAccountId: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const artistSchema = z.object({
  profileId: z.string().uuid(),
  bio: localizedTextSchema,
  portraitUrl: z.string().url().nullable().optional(),
  socialLinks: z.record(z.string(), z.string().url()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const djSchema = z.object({
  profileId: z.string().uuid(),
  bio: localizedTextSchema,
  portraitUrl: z.string().url().nullable().optional(),
  soundcloudHandle: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const roomSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: localizedStringSchema,
  sceneConfig: z.record(z.unknown()),
  createdAt: z.string().datetime(),
});

export const setSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  djId: z.string().uuid(),
  title: localizedStringSchema,
  hlsManifestUrl: z.string().nullable().optional(),
  soundcloudTrackId: z.string().nullable().optional(),
  durationSeconds: z.number().int().nullable().optional(),
  coverArtworkId: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const artworkSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  artistId: z.string().uuid(),
  djId: z.string().uuid().nullable().optional(),
  roomId: z.string().uuid().nullable().optional(),
  setId: z.string().uuid().nullable().optional(),
  title: localizedStringSchema,
  story: localizedPortableTextSchema,
  priceCents: z.number().int().nonnegative(),
  currency: z.string().default("EUR"),
  medium: localizedTextSchema.optional(),
  dimensions: z.record(z.unknown()).default({}),
  imageUrl: z.string().nullable().optional(),
  gltfUrl: z.string().nullable().optional(),
  textures: z.array(z.string()).default([]),
  status: artworkStatusSchema,
  publishedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  artworkId: z.string().uuid(),
  stripeSessionId: z.string().nullable().optional(),
  transferGroup: z.string().nullable().optional(),
  amountCents: z.number().int().nonnegative(),
  status: orderStatusSchema,
  paidAt: z.string().datetime().nullable().optional(),
  shippedAt: z.string().datetime().nullable().optional(),
  deliveredAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const transactionSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  kind: transactionKindSchema,
  stripeObjectId: z.string().nullable().optional(),
  amountCents: z.number().int().nonnegative(),
  destinationAccount: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const consentLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  ipHash: z.string(),
  userAgent: z.string().nullable().optional(),
  consentVersion: z.string(),
  consents: z.record(z.unknown()),
  createdAt: z.string().datetime(),
});

export const auditEventSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid().nullable().optional(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  before: z.record(z.unknown()).nullable().optional(),
  after: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string().datetime(),
});

export const webhookEventSchema = z.object({
  id: z.string().uuid(),
  source: webhookSourceSchema,
  eventId: z.string(),
  payload: z.record(z.unknown()),
  processedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const aiDecisionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  model: z.string(),
  promptHash: z.string(),
  output: z.record(z.unknown()),
  decisionType: aiDecisionTypeSchema,
  createdAt: z.string().datetime(),
});

export const contractSchemas = {
  profileSchema,
  artistSchema,
  djSchema,
  roomSchema,
  setSchema,
  artworkSchema,
  orderSchema,
  transactionSchema,
  consentLogSchema,
  auditEventSchema,
  webhookEventSchema,
  aiDecisionSchema,
} as const;

export type ProfileContract = z.infer<typeof profileSchema>;
export type ArtistContract = z.infer<typeof artistSchema>;
export type DjContract = z.infer<typeof djSchema>;
export type RoomContract = z.infer<typeof roomSchema>;
export type SetContract = z.infer<typeof setSchema>;
export type ArtworkContract = z.infer<typeof artworkSchema>;
export type OrderContract = z.infer<typeof orderSchema>;
export type TransactionContract = z.infer<typeof transactionSchema>;
export type ConsentLogContract = z.infer<typeof consentLogSchema>;
export type AuditEventContract = z.infer<typeof auditEventSchema>;
export type WebhookEventContract = z.infer<typeof webhookEventSchema>;
export type AiDecisionContract = z.infer<typeof aiDecisionSchema>;
