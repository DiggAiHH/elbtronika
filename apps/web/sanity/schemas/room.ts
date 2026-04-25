import { defineField, defineType } from "sanity";

// Room = 3D immersive space. Contains artworks + a featured DJ set.
export const roomSchema = defineType({
  name: "room",
  title: "Room (3D Space)",
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
    // 3D environment config
    defineField({
      name: "environment",
      title: "3D Environment",
      type: "object",
      fields: [
        defineField({
          name: "skyboxUrl",
          title: "Skybox URL (R2)",
          type: "string",
          description: "cdn.elbtronika.art/rooms/<slug>/skybox.hdr",
        }),
        defineField({
          name: "ambientLightIntensity",
          title: "Ambient Light Intensity",
          type: "number",
          initialValue: 0.5,
        }),
        defineField({
          name: "fogDensity",
          title: "Fog Density",
          type: "number",
          initialValue: 0.02,
        }),
      ],
    }),
    // Artworks placed in the room
    defineField({
      name: "artworks",
      title: "Artworks",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "artwork",
              title: "Artwork",
              type: "reference",
              to: [{ type: "artwork" }],
            }),
            defineField({
              name: "position",
              title: "Position (x, y, z)",
              type: "object",
              fields: [
                { name: "x", type: "number", title: "X" },
                { name: "y", type: "number", title: "Y" },
                { name: "z", type: "number", title: "Z" },
              ],
            }),
            defineField({
              name: "rotation",
              title: "Rotation Y (degrees)",
              type: "number",
              initialValue: 0,
            }),
          ],
          preview: {
            select: { title: "artwork.title", media: "artwork.image" },
          },
        },
      ],
    }),
    // Featured DJ set for spatial audio
    defineField({
      name: "featuredSet",
      title: "Featured DJ Set",
      type: "reference",
      to: [{ type: "set" }],
    }),
  ],
  preview: {
    select: { title: "title", media: "coverImage" },
  },
});
