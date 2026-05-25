import type { GlobalConfig } from 'payload'

export const SocialSettings: GlobalConfig = {
  slug: 'social-settings',
  label: 'Social Settings',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: 'Social',
    description: 'Social profile URLs, daily publish schedule, and platform connection tokens.',
  },
  fields: [
    {
      name: 'dailyPublishHour',
      type: 'select',
      label: 'Daily Publish Time (Pacific)',
      defaultValue: '9',
      admin: {
        description:
          'Pre-fills the schedule time in the compose form. To change the actual cron schedule, update vercel.json and redeploy.',
      },
      options: [
        { label: '7:00 AM Pacific', value: '7' },
        { label: '8:00 AM Pacific', value: '8' },
        { label: '9:00 AM Pacific', value: '9' },
        { label: '10:00 AM Pacific', value: '10' },
        { label: '11:00 AM Pacific', value: '11' },
        { label: '12:00 PM Pacific', value: '12' },
        { label: '1:00 PM Pacific', value: '13' },
        { label: '2:00 PM Pacific', value: '14' },
        { label: '3:00 PM Pacific', value: '15' },
      ],
    },
    {
      name: 'profiles',
      type: 'array',
      label: 'Social Profiles',
      admin: {
        description: "The site owner's profiles on each social platform",
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
    {
      name: 'linkedin',
      type: 'group',
      label: 'LinkedIn',
      admin: {
        description: 'Tokens are set automatically via the LinkedIn connect flow in Posts → Share tab.',
      },
      fields: [
        { name: 'accessToken', type: 'text', label: 'Access Token', admin: { readOnly: true } },
        { name: 'expiresAt', type: 'date', label: 'Token Expires At', admin: { readOnly: true } },
        { name: 'personUrn', type: 'text', label: 'Person URN', admin: { readOnly: true } },
      ],
    },
    {
      name: 'threads',
      type: 'group',
      label: 'Threads',
      admin: {
        description: 'Tokens are set automatically via the Threads connect flow in Posts → Share tab.',
      },
      fields: [
        { name: 'accessToken', type: 'text', label: 'Access Token', admin: { readOnly: true } },
        { name: 'userId', type: 'text', label: 'User ID', admin: { readOnly: true } },
        { name: 'expiresAt', type: 'date', label: 'Token Expires At', admin: { readOnly: true } },
      ],
    },
    {
      name: 'twitter',
      type: 'group',
      label: 'Twitter / X',
      admin: {
        description: 'Tokens are set automatically via the Twitter / X connect flow in Posts → Share tab.',
      },
      fields: [
        { name: 'accessToken', type: 'text', label: 'Access Token', admin: { readOnly: true } },
        { name: 'refreshToken', type: 'text', label: 'Refresh Token', admin: { readOnly: true } },
        { name: 'expiresAt', type: 'date', label: 'Token Expires At', admin: { readOnly: true } },
        { name: 'userId', type: 'text', label: 'User ID', admin: { readOnly: true } },
        { name: 'username', type: 'text', label: 'Username', admin: { readOnly: true } },
      ],
    },
  ],
}
