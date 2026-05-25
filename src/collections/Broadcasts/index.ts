import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { sendBroadcastHandler } from './handlers/send'
import { cancelBroadcastHandler } from './handlers/cancel'
import { weeklyPostsHandler } from './handlers/weeklyPosts'
import { getServerSideURL } from '../../utilities/getURL'

export const Broadcasts: CollectionConfig = {
  slug: 'broadcasts',
  versions: {
    drafts: {
      autosave: { interval: 100 },
    },
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'type', 'sendStatus', 'sentAt', 'updatedAt'],
    group: 'Email',
    livePreview: {
      url: ({ data }) => {
        if (!data?.id) return null
        return `${getServerSideURL()}/broadcast-preview/${data.id}`
      },
    },
    components: {
      edit: {
        PublishButton: '@/collections/Broadcasts/components/SendBroadcastButton#SendBroadcastButton',
      },
    },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  endpoints: [
    {
      // GET /api/broadcasts/weekly-posts
      // Returns post IDs published in the last 7 days for pre-populating weekly digests
      path: '/weekly-posts',
      method: 'get',
      handler: weeklyPostsHandler,
    },
    {
      // POST /api/broadcasts/:id/send
      // Assembles the email, calls Resend, and writes back status fields
      path: '/:id/send',
      method: 'post',
      handler: sendBroadcastHandler,
    },
    {
      // POST /api/broadcasts/:id/cancel
      // Cancels a scheduled broadcast in Resend and resets status to draft
      path: '/:id/cancel',
      method: 'post',
      handler: cancelBroadcastHandler,
    },
  ],
  fields: [
    // -------------------------------------------------------------------------
    // Shared fields — present on every broadcast type
    // -------------------------------------------------------------------------
    {
      name: 'audienceTopic',
      label: 'Audience Topic',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      required: false,
      admin: {
        description:
          'Target a specific topic (Post Category). Leave empty to send to the full audience.',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'custom',
      options: [
        { label: 'Single Post', value: 'single_post' },
        { label: 'Weekly Digest', value: 'weekly_digest' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Email subject line shown to recipients',
      },
    },
    {
      name: 'previewText',
      type: 'text',
      admin: {
        description: 'Short snippet shown in the inbox before the email is opened',
      },
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Admin-drafted copy — appears above post cards in every broadcast type',
      },
    },
    {
      name: 'scheduledAt',
      type: 'date',
      admin: {
        condition: (data) => data?.sendStatus !== 'scheduled' && data?.sendStatus !== 'sent',
        components: {
          Field:
            '@/collections/Broadcasts/components/BroadcastScheduleField#BroadcastScheduleField',
        },
      },
    },

    // -------------------------------------------------------------------------
    // Conditional: single_post + weekly_digest
    // -------------------------------------------------------------------------
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        condition: (data) => data?.type === 'single_post' || data?.type === 'weekly_digest',
        description: 'For single_post: select one post. For weekly_digest: curate multiple posts.',
        sortOptions: '-publishedAt',
      },
    },
    {
      // Custom React button that calls /api/broadcasts/weekly-posts and
      // pre-populates the `posts` relationship field above
      name: 'pullPostsButton',
      type: 'ui',
      admin: {
        condition: (data) => data?.type === 'weekly_digest',
        components: {
          Field: '@/collections/Broadcasts/components/PullPostsButton',
        },
      },
    },

    // -------------------------------------------------------------------------
    // Resend sync fields — readOnly, system writes only
    // -------------------------------------------------------------------------
    {
      type: 'row',
      fields: [
        {
          name: 'sendStatus',
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
          ],
          admin: {
            readOnly: true,
            description: 'Managed by the system — updated after Resend API calls',
          },
        },
        {
          name: 'resendBroadcastId',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'ID returned by Resend after the broadcast is created',
          },
        },
      ],
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Populated on successful send',
      },
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Populated on send failure — check here when status is "failed"',
      },
    },
  ],
}
