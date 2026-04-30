import { defineField, defineType } from 'sanity'

const localizedStringFields = [
  defineField({ name: 'de', title: 'Deutsch', type: 'string', validation: (rule) => rule.required() }),
  defineField({ name: 'en', title: 'English', type: 'string' }),
]

export const artwork = defineType({
  name: 'artwork',
  title: 'Artwork',
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
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      to: [{ type: 'artist' as const }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dj',
      title: 'DJ',
      type: 'reference',
      to: [{ type: 'dj' as const }],
    }),
    defineField({
      name: 'room',
      title: 'Room',
      type: 'reference',
      to: [{ type: 'room' as const }],
    }),
    defineField({
      name: 'set',
      title: 'Set',
      type: 'reference',
      to: [{ type: 'set' as const }],
    }),
    defineField({
      name: 'story',
      title: 'Story',
      type: 'story',
    }),
    defineField({
      name: 'priceCents',
      title: 'Price (cents)',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'EUR',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'object',
      fields: localizedStringFields,
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'object',
      fields: [
        defineField({ name: 'widthCm', type: 'number', validation: (rule) => rule.positive() }),
        defineField({ name: 'heightCm', type: 'number', validation: (rule) => rule.positive() }),
        defineField({ name: 'depthCm', type: 'number', validation: (rule) => rule.min(0) }),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Image',
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
    defineField({
      name: 'gltfUrl',
      title: 'GLTF URL',
      type: 'url',
    }),
    defineField({
      name: 'textures',
      title: 'Textures',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'kind', type: 'string' }),
            defineField({ name: 'url', type: 'url' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['draft', 'published', 'sold', 'archived'],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
  ],
})
