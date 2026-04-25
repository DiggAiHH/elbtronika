import { z } from "zod";

export const ArtistSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(), // FK → profiles.id
  slug: z.string().min(1).max(200),
  nameDe: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200).optional(),
  bioDe: z.string().max(2000).optional(),
  bioEn: z.string().max(2000).optional(),
  portraitUrl: z.string().url().optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .default({}),
  stripeAccountId: z.string().optional(),
  countryCode: z.string().length(2), // For tax / VAT calculations
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Artist = z.infer<typeof ArtistSchema>;

export const CreateArtistSchema = ArtistSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateArtist = z.infer<typeof CreateArtistSchema>;
