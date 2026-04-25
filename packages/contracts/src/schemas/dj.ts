import { z } from "zod";

export const DjSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(), // FK → profiles.id
  slug: z.string().min(1).max(200),
  nameDe: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200).optional(),
  bioDe: z.string().max(2000).optional(),
  bioEn: z.string().max(2000).optional(),
  portraitUrl: z.string().url().optional(),
  soundcloudHandle: z.string().max(100).optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().optional(),
      soundcloud: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .default({}),
  stripeAccountId: z.string().optional(),
  countryCode: z.string().length(2),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Dj = z.infer<typeof DjSchema>;

export const CreateDjSchema = DjSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateDj = z.infer<typeof CreateDjSchema>;

export const SetSchema = z.object({
  id: z.string().uuid(),
  djId: z.string().uuid(),
  titleDe: z.string().min(1).max(300),
  titleEn: z.string().min(1).max(300).optional(),
  soundcloudTrackId: z.string().optional(),
  hlsManifestUrl: z.string().url().optional(), // R2 CDN HLS manifest
  durationSeconds: z.number().int().positive().optional(),
  coverArtworkId: z.string().uuid().optional(),
  isExclusive: z.boolean().default(false), // If true: only for buyers
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Set = z.infer<typeof SetSchema>;
