import type { GlobalConfig } from 'payload'

export const BlueSkySettings: GlobalConfig = {
  slug: 'bluesky-settings',
  label: 'BlueSky Settings',
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'handle',
      type: 'text',
      label: 'Handle',
      admin: {
        description: 'Your BlueSky handle, e.g. username.bsky.social',
        readOnly: true,
      },
    },
    {
      name: 'appPassword',
      type: 'text',
      label: 'App Password',
      admin: {
        description: 'Generate an App Password from your BlueSky account settings — do not use your main password.',
        readOnly: true,
      },
    },
    {
      name: 'did',
      type: 'text',
      label: 'DID',
      admin: {
        description: 'Decentralized identifier — populated automatically on first connect.',
        readOnly: true,
      },
    },
  ],
}
