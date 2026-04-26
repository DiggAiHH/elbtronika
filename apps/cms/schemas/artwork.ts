import { defineField, defineType } from 'sanity'

export const artwork = defineType({
  name: 'artwork',
  title: 'Artwork',
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
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      to: [{ type: 'artist' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'additionalImages',
      title: 'Additional Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'r2Key',
      title: 'R2 Asset Key',
      type: 'string',
      description: 'Cloudflare R2 object key for 3D model / high-res asset',
      readOnly: true,
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g. 80 × 60 cm',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'price',
      title: 'Price (EUR cents)',
      type: 'number',
      description: 'Price in euro cents (e.g. 50000 = €500.00)',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'edition',
      title: 'Edition',
      type: 'object',
      fields: [
        defineField({ name: 'total', title: 'Total Copies', type: 'number' }),
        defineField({ name: 'sold', title: 'Sold', type: 'number' }),
      ],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['draft', 'in_review', 'published', 'sold_out', 'archived'],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'associatedDj',
      title: 'Associated DJ',
      type: 'reference',
      to: [{ type: 'dj' }],
      description: 'DJ whose music is paired with this artwork in Immersive Mode',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'artist.displayName',
      media: 'mainImage',
    },
    prepare({ title, artist, media }) {
      return { title, subtitle: artist, media }
    },
  },
})
