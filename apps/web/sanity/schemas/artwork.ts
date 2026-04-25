import { defineField, defineType } from "sanity";

export const artworkSchema = defineType({
  name: "artwork",
  title: "Artwork",
  type: "document",
  fields: [
    defineField({
      name: "supabaseId",
      title: "Supabase Artwork ID",
      type: "string",
      description: "UUID from the Supabase artworks table",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "artist",
      title: "Artist",
      type: "reference",
      to: [{ type: "artist" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description (Rich Text)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "medium",
      title: "Medium",
      type: "string",
      description: "e.g. Digital Art, Oil on Canvas, Generative AI",
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      type: "string",
      description: 'e.g. "120 × 80 cm"',
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
    }),
    defineField({
      name: "genreTags",
      title: "Genre Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    // Linked room/set for immersive experience
    defineField({
      name: "featuredInRoom",
      title: "Featured in Room",
      type: "reference",
      to: [{ type: "room" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "artist.name", media: "image" },
  },
});
