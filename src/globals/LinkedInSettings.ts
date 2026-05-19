import type { GlobalConfig } from 'payload'

export const LinkedInSettings: GlobalConfig = {
  slug: 'linkedin-settings',
  label: 'LinkedIn Settings',
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'accessToken',
      type: 'text',
      label: 'Access Token',
      admin: { readOnly: true },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Token Expires At',
      admin: { readOnly: true },
    },
    {
      name: 'personUrn',
      type: 'text',
      label: 'Person URN',
      admin: { readOnly: true },
    },
  ],
}
