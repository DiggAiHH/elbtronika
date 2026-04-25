import { defineField, defineType } from "sanity";

// DJ Set = audio mix with HLS stream
export const setSchema = defineType({
  name: "set",
  title: "DJ Set",
  type: "document",
  fields: [
    defineField({
      name: "supabaseId",
      title: "Supabase Set ID",
      type: "string",
      description: "UUID from the Supabase sets table",
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
      name: "dj",
      title: "DJ",
      type: "reference",
      to: [{ type: "dj" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
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
      name: "bpm",
      title: "BPM",
      type: "number",
    }),
    defineField({
      name: "durationMin",
      title: "Duration (minutes)",
      type: "number",
    }),
    // Tracklist (optional editorial content)
    defineField({
      name: "tracklist",
      title: "Tracklist",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "position", title: "Position", type: "number" },
            { name: "artist", title: "Artist", type: "string" },
            { name: "track", title: "Track", type: "string" },
            { name: "label", title: "Label", type: "string" },
          ],
          preview: {
            select: { title: "track", subtitle: "artist" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "dj.name", media: "coverImage" },
  },
});
