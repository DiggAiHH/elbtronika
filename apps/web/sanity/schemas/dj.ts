import { defineField, defineType } from "sanity";

export const djSchema = defineType({
  name: "dj",
  title: "DJ",
  type: "document",
  fields: [
    defineField({
      name: "supabaseId",
      title: "Supabase DJ ID",
      type: "string",
      description: "UUID from the Supabase djs table",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bio",
      title: "Bio (Rich Text)",
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
  ],
  preview: {
    select: { title: "name", media: "avatar" },
  },
});
