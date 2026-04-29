import { defineField, defineType } from 'sanity'

/**
 * Set — DJ Audio Set
 *
 * A DJ mix or recorded set streamed via HLS.
 * Sets are linked to artworks and rooms for Spatial Audio in Immersive Mode.
 * The hls_url points to a manifest on cdn.elbtronika.art (Cloudflare R2).
 */
export const set = defineType({
  name: 'set',
  title: 'Set',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dj',
      title: 'DJ',
      type: 'reference',
      to: [{ type: 'dj' }],
      validation: (Rule) => Rule.required(),
    }),

    // --- Audio Source ---
    defineField({
      name: 'soundcloudTrackId',
      title: 'SoundCloud Track ID',
      type: 'string',
      description: 'Numeric track ID from SoundCloud URL — used by the proxy Edge Function',
    }),
    defineField({
      name: 'hlsUrl',
      title: 'HLS Manifest URL',
      type: 'url',
      description: 'cdn.elbtronika.art/sets/<id>/index.m3u8 — populated after R2 upload & encoding',
    }),
    defineField({
      name: 'r2AudioKey',
      title: 'R2 Audio Source Key',
      type: 'string',
      description: 'Cloudflare R2 object key for the source audio file (pre-HLS encoding)',
      readOnly: true,
    }),

    // --- Metadata ---
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'durationSec',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: 'bpm',
      title: 'BPM',
      type: 'number',
      validation: (Rule) => Rule.min(60).max(220).integer(),
    }),
    defineField({
      name: 'genreTags',
      title: 'Genre Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // --- Status ---
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Processing', value: 'processing' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      dj: 'dj.displayName',
      media: 'coverImage',
      status: 'status',
    },
    prepare({ title, dj, media, status }) {
      return {
        title,
        subtitle: `${dj ?? 'No DJ'} · ${status ?? 'draft'}`,
        media,
      }
    },
  },
})
