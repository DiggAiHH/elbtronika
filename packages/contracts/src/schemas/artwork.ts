import { z } from "zod";

export const ArtworkStatusSchema = z.enum([
  "draft",
  "published",
  "sold",
  "archived",
]);
export type ArtworkStatus = z.infer<typeof ArtworkStatusSchema>;

export const ArtworkSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(200),
  titleDe: z.string().min(1).max(300),
  titleEn: z.string().min(1).max(300).optional(),
  storyDe: z.unknown(), // Sanity PortableText – typed in Phase 5
  storyEn: z.unknown().optional(),
  artistId: z.string().uuid(),
  djId: z.string().uuid().optional(),
  setId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  priceCents: z.number().int().positive(), // Always in cents (EUR)
  currency: z.literal("EUR"),
  medium: z.string().max(200).optional(),
  dimensionsCm: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
      depth: z.number().positive().optional(),
    })
    .optional(),
  primaryImageUrl: z.string().url(),
  gltfUrl: z.string().url().optional(), // R2 CDN URL
  status: ArtworkStatusSchema,
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Artwork = z.infer<typeof ArtworkSchema>;

export const CreateArtworkSchema = ArtworkSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  status: ArtworkStatusSchema.default("draft"),
});
export type CreateArtwork = z.infer<typeof CreateArtworkSchema>;
