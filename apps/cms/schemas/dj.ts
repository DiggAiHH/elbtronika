import { defineField, defineType } from "sanity";

/** DJ — field names aligned with the web app's GROQ queries (2026-07-16). */
export const dj = defineType({
  name: "dj",
  title: "DJ",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "supabaseId",
      title: "Supabase ID",
      type: "string",
      description: "Links CMS DJ profile to the Supabase profile row",
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "text",
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "genreTags",
      title: "Genre Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "instagram",
      title: "Instagram Handle",
      type: "string",
    }),
    defineField({
      name: "soundcloud",
      title: "SoundCloud URL",
      type: "url",
    }),
    defineField({
      name: "isDemo",
      title: "Demo Content",
      type: "boolean",
      initialValue: false,
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
    select: { title: "name", media: "avatar" },
  },
});
