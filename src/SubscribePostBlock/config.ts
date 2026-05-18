import type { GlobalConfig } from 'payload'

export const SubscribePostBlock: GlobalConfig = {
  slug: 'subscribe-post-block',
  label: 'Subscribe Post Block',
  fields: [
    {
      name: 'description',
      type: 'textarea',
      defaultValue: 'Get updates in your inbox. No spam.',
      admin: { description: 'Short description shown above the email input' },
    },
    {
      name: 'placeholder',
      type: 'text',
      defaultValue: 'Enter your email',
      admin: { description: 'Email input placeholder text' },
    },
    {
      name: 'buttonText',
      type: 'text',
      defaultValue: 'Subscribe',
      admin: { description: 'Subscribe button label' },
    },
    {
      name: 'meta',
      type: 'text',
      defaultValue: 'UNSUBSCRIBE WHENEVER',
      admin: { description: 'Stat line shown below the form (e.g. "UNSUBSCRIBE WHENEVER")' },
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'post-sidebar',
      admin: { description: 'Stored with subscriber record to track signup origin' },
    },
  ],
}
