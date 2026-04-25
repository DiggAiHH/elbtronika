import { z } from "zod";

export const UserRoleSchema = z.enum(["visitor", "collector", "artist", "dj", "curator", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  stripeAccountId: z.string().optional(),
  stripeStatus: z.enum(["pending", "enabled", "disabled"]).optional(),
  countryCode: z.string().length(2).optional(), // ISO 3166-1 alpha-2
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const CreateProfileSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateProfile = z.infer<typeof CreateProfileSchema>;
