import type { GlobalConfig } from 'payload'

export const LinkedInSettings: GlobalConfig = {
  slug: 'linkedin-settings',
  label: 'LinkedIn Settings',
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: 'Social',
    description: 'OAuth tokens are set automatically via the LinkedIn connect flow in the Posts Share tab.',
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
