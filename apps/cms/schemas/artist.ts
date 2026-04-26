import { defineField, defineType } from 'sanity'

export const artist = defineType({
  name: 'artist',
  title: 'Artist',
  type: 'document',
  fields: [
    defineField({
      name: 'displayName',
      title: 'Display Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'displayName', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'supabaseUserId',
      title: 'Supabase User ID',
      type: 'string',
      description: 'Links CMS artist profile to Supabase auth user',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram Handle',
      type: 'string',
    }),
    defineField({
      name: 'stripeAccountId',
      title: 'Stripe Connect Account ID',
      type: 'string',
      description: 'acct_… — set after KYC approval',
      readOnly: true,
    }),
    defineField({
      name: 'kycStatus',
      title: 'KYC Status',
      type: 'string',
      options: {
        list: ['pending', 'in_review', 'approved', 'rejected'],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
  ],
  preview: {
    select: { title: 'displayName', media: 'avatar' },
  },
})
