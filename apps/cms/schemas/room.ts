import { defineField, defineType } from "sanity";

/**
 * Room — 3D Gallery Space
 *
 * Each room is a named 3D environment in Immersive Mode.
 * Configuration is managed here; runtime rendering uses these values
 * to select skybox, lighting preset, and position artwork slots.
 *
 * Replaces the earlier "exhibition" concept — rooms are permanent
 * spaces, not time-limited shows.
 */
export const room = defineType({
  name: "room",
  title: "Room",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Curator notes shown to visitors entering this room",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      description: "Thumbnail used in room-selection UI",
    }),

    // --- 3D Scene Configuration ---
    defineField({
      name: "skybox",
      title: "Skybox Preset",
      type: "string",
      options: {
        list: [
          { title: "Dark Club", value: "dark_club" },
          { title: "Industrial", value: "industrial" },
          { title: "Concrete Brutalist", value: "concrete" },
          { title: "Void (Pure Black)", value: "void" },
          { title: "Nebula (Space)", value: "nebula" },
        ],
        layout: "radio",
      },
      initialValue: "dark_club",
    }),
    defineField({
      name: "lightingPreset",
      title: "Lighting Preset",
      type: "string",
      options: {
        list: [
          { title: "Warm Gallery", value: "warm_gallery" },
          { title: "Cold Gallery", value: "cold_gallery" },
          { title: "Dramatic Contrast", value: "dramatic" },
          { title: "Neon Accent", value: "neon" },
          { title: "Ambient Low", value: "ambient" },
        ],
        layout: "radio",
      },
      initialValue: "warm_gallery",
    }),
    defineField({
      name: "maxArtworks",
      title: "Max Artwork Slots",
      type: "number",
      description: "Maximum number of artworks that can occupy this room simultaneously",
      validation: (Rule) => Rule.min(1).max(20).integer(),
      initialValue: 6,
    }),

    // --- Content Links ---
    defineField({
      name: "artworkSlots",
      title: "Artwork Slots",
      type: "array",
      of: [{ type: "reference", to: [{ type: "artwork" }] }],
      description: "Ordered list of artworks placed in this room",
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: "featuredDj",
      title: "Featured DJ",
      type: "reference",
      to: [{ type: "dj" }],
      description: "DJ providing ambient spatial audio for this room",
    }),

    // --- Status ---
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Upcoming", value: "upcoming" },
          { title: "Open", value: "open" },
          { title: "Closed", value: "closed" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "upcoming",
    }),
    defineField({
      name: "curatorNotes",
      title: "Curator Notes",
      type: "text",
      description: "Internal notes — not shown publicly",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      status: "status",
    },
    prepare({ title, media, status }) {
      return { title, subtitle: `${status ?? "draft"}`, media };
    },
  },
});
