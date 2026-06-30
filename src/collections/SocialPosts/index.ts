import type { CollectionConfig } from 'payload'
import { socialPostBeforeChange } from './hooks/socialPostBeforeChange'
import { getNextPublishDate } from '@/utilities/getNextPublishDate'

export const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  labels: {
    singular: 'Social Post',
    plural: 'Social Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['scheduledFor', 'title', 'linkedPost'],
    group: 'Social',
    components: {
      edit: {
        SaveButton: '@/collections/SocialPosts/components/SocialPostSaveArea#SocialPostSaveArea',
      },
    },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [socialPostBeforeChange],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal label for this post — not published.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        rows: 6,
        description: 'Text content for the social post.',
      },
    },
    {
      name: 'linkedPost',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        description:
          'Optional: link to a Post to include its URL (auto-generates a short URL). Leave blank for a standalone post.',
        sortOptions: '-publishedAt',
      },
    },
    {
      name: 'keywords',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      admin: {
        components: {
          Field: '@/collections/SocialPosts/components/KeywordsField#KeywordsField',
        },
      },
    },
    {
      name: 'postType',
      type: 'select',
      defaultValue: 'url',
      required: true,
      options: [
        { label: 'URL', value: 'url' },
        { label: 'Image', value: 'image' },
        { label: 'Content', value: 'content' },
      ],
      admin: {
        description: 'URL = link-card post. Image = photo/carousel. Content = text only.',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'URL to share. Auto-populated from the linked Post; edit to override.',
        condition: (data) => (data?.postType ?? 'url') === 'url' && !data?.linkedPost,
      },
    },
    {
      name: 'linkedPostAutoFill',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/SocialPosts/components/LinkedPostAutoFill',
        },
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        description:
          'Link-card title. Auto-scraped from the URL (internal or external); edit to override.',
        condition: (data) => (data?.postType ?? 'url') === 'url',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        rows: 2,
        description:
          'Link-card description. Auto-scraped from the URL; edit to override.',
        condition: (data) => (data?.postType ?? 'url') === 'url',
      },
    },
    {
      name: 'metaImageUrl',
      type: 'text',
      admin: {
        description:
          'Link-card image URL. Auto-scraped from the URL; paste an absolute image URL to override.',
        condition: (data) => (data?.postType ?? 'url') === 'url',
      },
    },
    {
      name: 'socialCardPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/SocialPosts/components/SocialCardPreview#SocialCardPreview',
        },
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'images',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: '1 image = single image post. 2+ = carousel / multi-image post.',
        condition: (data) => data?.postType === 'image',
        sortOptions: '-createdAt',
        components: {
          Field: '@/collections/SocialPosts/components/ImagesField#ImagesField',
        },
      },
    },
    {
      name: 'platforms',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/collections/SocialPosts/components/PlatformsArrayField#PlatformsArrayField',
          Cell: '@/collections/SocialPosts/components/PlatformsCell#PlatformsCell',
        },
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'BlueSky', value: 'bluesky' },
            { label: 'Threads', value: 'threads' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Published', value: 'published' },
            { label: 'Failed', value: 'failed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          admin: { readOnly: true },
        },
        {
          name: 'publishedAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'publishedUrl',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'errorMessage',
          type: 'text',
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'scheduledFor',
      type: 'date',
      defaultValue: async () => (await getNextPublishDate({ hourOffset: -1 })).toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        components: {
          Field: '@/collections/SocialPosts/components/ScheduledForField#ScheduledForField',
        },
      },
    },
    {
      name: 'shortUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-generated short URL — created when a linked Post is selected.',
      },
    },
  ],
}
