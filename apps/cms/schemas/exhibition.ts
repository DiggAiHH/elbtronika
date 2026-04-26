import { defineField, defineType } from 'sanity'

export const exhibition = defineType({
  name: 'exhibition',
  title: 'Exhibition',
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
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'artworks',
      title: 'Artworks',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
    }),
    defineField({
      name: 'featuredDj',
      title: 'Featured DJ',
      type: 'reference',
      to: [{ type: 'dj' }],
      description: 'DJ providing the spatial audio for this exhibition',
    }),
    defineField({
      name: 'openingDate',
      title: 'Opening Date',
      type: 'datetime',
    }),
    defineField({
      name: 'closingDate',
      title: 'Closing Date',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['upcoming', 'open', 'closed', 'archived'],
        layout: 'radio',
      },
      initialValue: 'upcoming',
    }),
    defineField({
      name: 'curatorNotes',
      title: 'Curator Notes',
      type: 'text',
      description: 'Internal notes — not shown publicly',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', status: 'status' },
    prepare({ title, media, status }) {
      return { title, subtitle: status, media }
    },
  },
})
