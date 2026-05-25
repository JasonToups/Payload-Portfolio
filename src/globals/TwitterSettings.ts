import type { GlobalConfig } from 'payload'

export const TwitterSettings: GlobalConfig = {
  slug: 'twitter-settings',
  label: 'Twitter / X Settings',
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: { hidden: true },
  fields: [
    {
      name: 'accessToken',
      type: 'text',
      label: 'Access Token',
      admin: { readOnly: true },
    },
    {
      name: 'refreshToken',
      type: 'text',
      label: 'Refresh Token',
      admin: { readOnly: true },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Token Expires At',
      admin: { readOnly: true },
    },
    {
      name: 'userId',
      type: 'text',
      label: 'User ID',
      admin: { readOnly: true },
    },
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      admin: { readOnly: true },
    },
  ],
}
