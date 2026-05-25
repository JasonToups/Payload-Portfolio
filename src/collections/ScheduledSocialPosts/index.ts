import type { CollectionConfig } from 'payload'

export const ScheduledSocialPosts: CollectionConfig = {
  slug: 'scheduled-social-posts',
  labels: {
    singular: 'Scheduled Social Post',
    plural: 'Scheduled Social Posts',
  },
  admin: {
    useAsTitle: 'platform',
    defaultColumns: ['post', 'platform', 'status', 'scheduledFor', 'publishedAt'],
    group: 'Social',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      admin: {
        description: 'The Payload Post to share.',
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
        description: 'Social media platform to publish to.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        description: "Text content for the social post. Pre-filled from the Post's Social Post Body.",
        rows: 5,
        components: {
          Field: '@/collections/ScheduledSocialPosts/components/ScheduledPostBodyField#ScheduledPostBodyField',
        },
      },
    },
    {
      name: 'scheduledFor',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Date and time the post should be published.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Published', value: 'published' },
            { label: 'Failed', value: 'failed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          admin: {
            readOnly: true,
            description: 'Managed by the scheduler — do not edit manually.',
          },
        },
        {
          name: 'publishedAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Populated on successful publish.',
          },
        },
      ],
    },
    {
      name: 'publishedUrl',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'URL of the published social post.',
      },
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Populated on failure — check here when status is "failed".',
      },
    },
  ],
}
