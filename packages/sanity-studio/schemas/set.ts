import { defineField, defineType } from 'sanity'

const localizedStringFields = [
  defineField({ name: 'de', title: 'Deutsch', type: 'string', validation: (rule) => rule.required() }),
  defineField({ name: 'en', title: 'English', type: 'string' }),
]

export const set = defineType({
  name: 'set',
  title: 'Set',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: { title?: { de?: string } }) => doc?.title?.de ?? '',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'object',
      fields: localizedStringFields,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dj',
      title: 'DJ',
      type: 'reference',
      to: [{ type: 'dj' as const }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hlsManifestUrl',
      title: 'HLS Manifest URL',
      type: 'url',
    }),
    defineField({
      name: 'soundcloudTrackId',
      title: 'SoundCloud Track ID',
      type: 'string',
    }),
    defineField({
      name: 'durationSeconds',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'coverArtwork',
      title: 'Cover Artwork',
      type: 'reference',
      to: [{ type: 'artwork' as const }],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Custom upload hook anchor: r2-presigned-upload',
      fields: [
        defineField({
          name: 'uploadHook',
          title: 'Upload Hook',
          type: 'string',
          readOnly: true,
          initialValue: 'r2-presigned-upload',
        }),
      ],
    }),
  ],
})
