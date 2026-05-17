import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'text',
      required: true,
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: 'Favicon',
      required: false,
      admin: {
        description: 'Used as the site favicon (appears in browser tabs and bookmarks)',
      },
    },
    {
      name: 'socials',
      type: 'group',
      label: 'Socials',
      fields: [
        {
          name: 'profiles',
          type: 'array',
          label: 'Social Profiles',
          admin: {
            description: 'The site owner\'s profiles on each social platform',
          },
          fields: [
            {
              name: 'platform',
              type: 'select',
              label: 'Platform',
              required: true,
              options: [
                { label: 'Twitter / X', value: 'twitter' },
                { label: 'Threads', value: 'threads' },
                { label: 'BlueSky', value: 'bluesky' },
                { label: 'LinkedIn', value: 'linkedin' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              label: 'Profile URL',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
