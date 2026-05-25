import type { GlobalConfig } from 'payload'

export const ThreadsSettings: GlobalConfig = {
  slug: 'threads-settings',
  label: 'Threads Settings',
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: 'Social',
    description: 'OAuth tokens are set automatically via the Threads connect flow in the Posts Share tab.',
  },
  fields: [
    {
      name: 'accessToken',
      type: 'text',
      label: 'Access Token',
      admin: { readOnly: true },
    },
    {
      name: 'userId',
      type: 'text',
      label: 'User ID',
      admin: { readOnly: true },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Token Expires At',
      admin: { readOnly: true },
    },
  ],
}
