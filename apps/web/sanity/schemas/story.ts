import { defineField, defineType } from "sanity";

// Story = editorial long-form content (artist interviews, exhibition notes)
export const storySchema = defineType({
  name: "story",
  title: "Story / Editorial",
  type: "document",
  fields: [
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
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt Text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
      ],
    }),
    // Related content
    defineField({
      name: "relatedArtists",
      title: "Related Artists",
      type: "array",
      of: [{ type: "reference", to: [{ type: "artist" }] }],
    }),
    defineField({
      name: "relatedArtworks",
      title: "Related Artworks",
      type: "array",
      of: [{ type: "reference", to: [{ type: "artwork" }] }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "author", media: "coverImage" },
  },
});
