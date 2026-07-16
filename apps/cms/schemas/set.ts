import { defineField, defineType } from "sanity";

/**
 * Set — DJ Audio Set
 *
 * A DJ mix or recorded set. Audio can live as a Sanity file asset
 * (audioFile, direct playback of mp3/aac) or as an HLS manifest on the CDN
 * (hlsUrl). Sets are linked to artworks and rooms for Spatial Audio in
 * Immersive Mode. Field names aligned with the web GROQ queries (2026-07-16):
 * durationMin (was durationSec), audioFile added.
 */
export const set = defineType({
  name: "set",
  title: "Set",
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
      name: "dj",
      title: "DJ",
      type: "reference",
      to: [{ type: "dj" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),

    // --- Audio Source ---
    defineField({
      name: "audioFile",
      title: "Audio File",
      type: "file",
      options: { accept: "audio/*" },
      description: "Direct audio asset (mp3/aac) — simplest playback path",
    }),
    defineField({
      name: "hlsUrl",
      title: "Stream URL (HLS manifest or direct audio)",
      type: "url",
      description:
        "cdn.elbtronika.art/sets/<id>/index.m3u8 — or the audioFile asset URL for direct playback",
    }),
    defineField({
      name: "soundcloudTrackId",
      title: "SoundCloud Track ID",
      type: "string",
      description: "Numeric track ID from SoundCloud URL — used by the proxy Edge Function",
    }),
    defineField({
      name: "r2AudioKey",
      title: "R2 Audio Source Key",
      type: "string",
      description: "Cloudflare R2 object key for the source audio file (pre-HLS encoding)",
      readOnly: true,
    }),

    // --- Metadata ---
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "durationMin",
      title: "Duration (minutes)",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "bpm",
      title: "BPM",
      type: "number",
      validation: (Rule) => Rule.min(60).max(220).integer(),
    }),
    defineField({
      name: "genreTags",
      title: "Genre Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "tracklist",
      title: "Tracklist",
      type: "array",
      of: [
        {
          type: "object",
          name: "tracklistEntry",
          fields: [
            defineField({ name: "position", title: "#", type: "number" }),
            defineField({ name: "artist", title: "Artist", type: "string" }),
            defineField({ name: "track", title: "Track", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: {
            select: { position: "position", artist: "artist", track: "track" },
            prepare({ position, artist, track }) {
              return { title: `${position ?? "–"}. ${artist ?? ""} – ${track ?? ""}` };
            },
          },
        },
      ],
    }),
    defineField({
      name: "supabaseId",
      title: "Supabase ID",
      type: "string",
      description: "UUID of the sets row in Supabase (audio_features join)",
    }),
    defineField({
      name: "isDemo",
      title: "Demo Content",
      type: "boolean",
      initialValue: false,
    }),

    // --- Status ---
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Processing", value: "processing" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
    }),
  ],
  preview: {
    select: {
      title: "title",
      dj: "dj.name",
      media: "coverImage",
      status: "status",
    },
    prepare({ title, dj, media, status }) {
      return {
        title,
        subtitle: `${dj ?? "No DJ"} · ${status ?? "draft"}`,
        media,
      };
    },
  },
});
