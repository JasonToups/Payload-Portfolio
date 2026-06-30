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
      name: 'timezone',
      type: 'select',
      label: 'Time Zone',
      defaultValue: 'America/Chicago',
      required: true,
      admin: {
        description: 'Time zone used for the Daily Publish Time and the default schedule on new social posts.',
      },
      options: [
        { label: 'Pacific Time (US)', value: 'America/Los_Angeles' },
        { label: 'Mountain Time (US)', value: 'America/Denver' },
        { label: 'Arizona (no DST)', value: 'America/Phoenix' },
        { label: 'Central Time (US)', value: 'America/Chicago' },
        { label: 'Eastern Time (US)', value: 'America/New_York' },
        { label: 'Alaska Time', value: 'America/Anchorage' },
        { label: 'Hawaii Time', value: 'Pacific/Honolulu' },
      ],
    },
    {
      name: 'dailyPublishHour',
      type: 'select',
      label: 'Daily Publish Time',
      defaultValue: '9',
      admin: {
        description:
          "Pre-fills the schedule time on new social posts (defaults them to 1 hour before this time, so they're ready when the daily publish cron runs). IMPORTANT: On Vercel's Free plan, the actual cron is a single daily run defined in vercel.json. To change when the cron literally fires, update vercel.json's `schedule` to match this hour in UTC and redeploy.",
      },
      options: [
        { label: '7:00 AM', value: '7' },
        { label: '8:00 AM', value: '8' },
        { label: '9:00 AM', value: '9' },
        { label: '10:00 AM', value: '10' },
        { label: '11:00 AM', value: '11' },
        { label: '12:00 PM', value: '12' },
        { label: '1:00 PM', value: '13' },
        { label: '2:00 PM', value: '14' },
        { label: '3:00 PM', value: '15' },
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
    {
      name: 'facebookConnect',
      type: 'ui',
      admin: {
        components: {
          Field: '@/globals/components/FacebookConnect#FacebookConnect',
        },
      },
    },
    {
      name: 'facebook',
      type: 'group',
      label: 'Facebook',
      admin: {
        description: 'Page token is set automatically via the Connect Facebook button above.',
      },
      fields: [
        { name: 'pageAccessToken', type: 'text', label: 'Page Access Token', admin: { readOnly: true } },
        { name: 'pageId', type: 'text', label: 'Page ID', admin: { readOnly: true } },
        { name: 'pageName', type: 'text', label: 'Page Name', admin: { readOnly: true } },
        { name: 'expiresAt', type: 'date', label: 'User Token Expires At', admin: { readOnly: true } },
      ],
    },
  ],
}
