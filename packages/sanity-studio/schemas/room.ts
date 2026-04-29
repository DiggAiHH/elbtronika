import { defineField, defineType } from 'sanity'

const localizedStringFields = [
  defineField({ name: 'de', title: 'Deutsch', type: 'string', validation: (rule) => rule.required() }),
  defineField({ name: 'en', title: 'English', type: 'string' }),
]

export const room = defineType({
  name: 'room',
  title: 'Room',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: { name?: { de?: string } }) => doc?.name?.de ?? '',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'object',
      fields: localizedStringFields,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sceneConfig',
      title: 'Scene Config',
      type: 'object',
      fields: [
        defineField({ name: 'skybox', type: 'string' }),
        defineField({ name: 'lighting', type: 'string' }),
        defineField({ name: 'slots', type: 'number' }),
      ],
    }),
  ],
})
