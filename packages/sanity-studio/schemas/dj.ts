import { defineField, defineType } from 'sanity'

const localizedStringFields = [
  defineField({ name: 'de', title: 'Deutsch', type: 'string', validation: (rule) => rule.required() }),
  defineField({ name: 'en', title: 'English', type: 'string' }),
]

const localizedTextFields = [
  defineField({ name: 'de', title: 'Deutsch', type: 'text' }),
  defineField({ name: 'en', title: 'English', type: 'text' }),
]

export const dj = defineType({
  name: 'dj',
  title: 'DJ',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'object',
      fields: localizedStringFields,
      validation: (rule) => rule.required(),
    }),
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
      name: 'profileId',
      title: 'Profile ID',
      type: 'string',
      description: 'Supabase profiles.id (UUID)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'object',
      fields: localizedTextFields,
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
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
      name: 'soundcloudHandle',
      title: 'SoundCloud Handle',
      type: 'string',
    }),
  ],
})
