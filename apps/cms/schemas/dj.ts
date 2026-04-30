import { defineField, defineType } from "sanity";

export const dj = defineType({
  name: "dj",
  title: "DJ",
  type: "document",
  fields: [
    defineField({
      name: "displayName",
      title: "Display Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "displayName", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "supabaseUserId",
      title: "Supabase User ID",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "genres",
      title: "Genres",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "soundcloudUrl",
      title: "SoundCloud URL",
      type: "url",
    }),
    defineField({
      name: "stripeAccountId",
      title: "Stripe Connect Account ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "kycStatus",
      title: "KYC Status",
      type: "string",
      options: {
        list: ["pending", "in_review", "approved", "rejected"],
        layout: "radio",
      },
      initialValue: "pending",
    }),
  ],
  preview: {
    select: { title: "displayName", media: "avatar" },
  },
});
