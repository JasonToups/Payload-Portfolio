import type { GlobalConfig } from 'payload'

export const EmailLayout: GlobalConfig = {
  slug: 'email-layout',
  label: 'Email Layout',
  admin: {
    group: 'Email',
    description:
      'Controls the visual design of all outgoing emails — header, footer, colors, and branding.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'header',
      label: 'Header',
      type: 'group',
      fields: [
        {
          name: 'logo',
          label: 'Logo',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Displayed at the top of every email. Recommended size: 200x60px.',
          },
        },
        {
          name: 'tagline',
          label: 'Tagline',
          type: 'text',
          required: false,
          admin: {
            description: 'Short line shown beneath the logo.',
          },
        },
        {
          name: 'bgColor',
          label: 'Background Color',
          type: 'text',
          defaultValue: '#ffffff',
          admin: {
            description: 'Hex color code for the header background (e.g. #ffffff).',
          },
        },
        {
          name: 'textColor',
          label: 'Text Color',
          type: 'text',
          defaultValue: '#000000',
          admin: {
            description: 'Hex color code for header text (e.g. #000000).',
          },
        },
      ],
    },
    {
      name: 'footer',
      label: 'Footer',
      type: 'group',
      fields: [
        {
          name: 'footerText',
          label: 'Footer Text',
          type: 'text',
          required: false,
          admin: {
            description:
              'Copyright line or short tagline shown in the footer (e.g. "© 2026 Jason Toups").',
          },
        },
        {
          name: 'mailingAddress',
          label: 'Mailing Address',
          type: 'text',
          required: true,
          admin: {
            description: 'Required by CAN-SPAM law. Shown in every email footer.',
          },
        },
        {
          name: 'socialLinks',
          label: 'Social Links',
          type: 'array',
          required: false,
          admin: {
            description: 'Links shown as icons/text in the footer.',
          },
          fields: [
            {
              name: 'platform',
              label: 'Platform',
              type: 'select',
              required: true,
              options: [
                { label: 'Twitter / X', value: 'twitter' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'GitHub', value: 'github' },
                { label: 'Website', value: 'website' },
              ],
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'unsubscribeText',
          label: 'Unsubscribe Text',
          type: 'text',
          required: false,
          defaultValue: 'Unsubscribe from this list',
          admin: {
            description: 'Label for the unsubscribe link injected by Resend.',
          },
        },
        {
          name: 'bgColor',
          label: 'Background Color',
          type: 'text',
          defaultValue: '#f4f4f4',
          admin: {
            description: 'Hex color code for the footer background (e.g. #f4f4f4).',
          },
        },
        {
          name: 'textColor',
          label: 'Text Color',
          type: 'text',
          defaultValue: '#666666',
          admin: {
            description: 'Hex color code for footer text (e.g. #666666).',
          },
        },
      ],
    },
  ],
}
