import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { sendBroadcastHandler } from './handlers/send'
import { cancelBroadcastHandler } from './handlers/cancel'
import { weeklyPostsHandler } from './handlers/weeklyPosts'
import { categoryPostsHandler } from './handlers/categoryPosts'
import { keywordPostsHandler } from './handlers/keywordPosts'
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
    defaultColumns: ['subject', 'template', 'sendStatus', 'sentAt', 'updatedAt'],
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
    {
      // GET /api/broadcasts/category-posts?categoryId=X&limit=N
      // Returns post IDs from a specific category for pre-populating category digest broadcasts
      path: '/category-posts',
      method: 'get',
      handler: categoryPostsHandler,
    },
    {
      // GET /api/broadcasts/keyword-posts?keywordId=X&limit=N
      // Returns post IDs tagged with a specific keyword for pre-populating keyword digest broadcasts
      path: '/keyword-posts',
      method: 'get',
      handler: keywordPostsHandler,
    },
  ],
  fields: [
    // -------------------------------------------------------------------------
    // Template relationship — drives all conditional logic via templateType
    // -------------------------------------------------------------------------
    {
      name: 'template',
      label: 'Template',
      type: 'relationship',
      relationTo: 'email-templates',
      hasMany: false,
      required: true,
      admin: {
        description: 'Select an Email Template. The template determines the broadcast type and audience.',
      },
    },
    {
      // Invisible side-effect field: watches `template`, fetches its templateType,
      // and writes the value into the hidden `templateType` field below so that
      // all other field conditions can read a stable string.
      name: 'templateTypeSync',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/Broadcasts/components/TemplateSelectorField',
        },
      },
    },
    {
      // Derived from the selected template. Persisted so the send handler and
      // email assembly can branch without an extra DB fetch.
      name: 'templateType',
      type: 'text',
      admin: {
        hidden: true,
      },
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
    // Conditional: single_post + digest types (not custom or welcome_email)
    // -------------------------------------------------------------------------
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        condition: (data) =>
          data?.templateType != null && data?.templateType !== 'custom' && data?.templateType !== 'welcome_email',
        description:
          'For single_post: select one post. For digest types: curate multiple posts (or use the pull button).',
        sortOptions: '-publishedAt',
      },
    },
    {
      // Custom React button — auto-pulls posts based on the selected template type.
      // Visible for weekly_digest, category_digest, and keyword_digest templates.
      name: 'pullPostsButton',
      type: 'ui',
      admin: {
        condition: (data) =>
          data?.templateType === 'weekly_digest' ||
          data?.templateType === 'category_digest' ||
          data?.templateType === 'keyword_digest',
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
