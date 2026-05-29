import type { CollectionConfig } from 'payload'

export const ShortUrls: CollectionConfig = {
  slug: 'short-urls',
  labels: {
    singular: 'Short URL',
    plural: 'Short URLs',
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'targetUrl', 'post', 'createdAt'],
    group: 'Social',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Auto-generated 6-char hex code used in the short URL path.',
        readOnly: true,
      },
    },
    {
      name: 'targetUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'The full URL this short code redirects to.',
      },
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        description: 'The post this short URL was generated for (optional reference).',
      },
    },
  ],
}
