import type { CollectionConfig } from 'payload'
import { socialPostBeforeChange } from './hooks/socialPostBeforeChange'

export const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  labels: {
    singular: 'Social Post',
    plural: 'Social Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'platform', 'status', 'scheduledFor', 'publishedAt'],
    group: 'Social',
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
      },
    },
    {
      name: 'keywords',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      admin: {
        description: 'Used as hashtags when publishing.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Primary image. Used as the featured/thumbnail image.',
      },
    },
    {
      name: 'images',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description:
          'Additional images. LinkedIn, Threads (2–20), and BlueSky (up to 4) support multiple images.',
      },
    },
    {
      name: 'publishActions',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/SocialPosts/components/SocialPostPublishButton',
        },
      },
    },
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
      admin: {
        position: 'sidebar',
        description: 'Social media platform to publish to.',
      },
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
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Managed by the scheduler — use "Publish Now" or set a schedule date.',
      },
    },
    {
      name: 'scheduledFor',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'When to publish. Setting a date auto-schedules the post. Leave blank and use "Publish Now" to publish immediately.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Populated on successful publish.',
      },
    },
    {
      name: 'publishedUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'URL of the published social post.',
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
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Populated on failure — check here when status is "failed".',
      },
    },
  ],
}
