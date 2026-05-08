import type { Block } from 'payload'

export const Marquee: Block = {
  slug: 'marquee',
  interfaceName: 'MarqueeBlock',
  labels: {
    singular: 'Marquee',
    plural: 'Marquee Blocks',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Optional small label above the ticker strip' },
    },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'text',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Images', value: 'images' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Text items to scroll. Every 3rd is auto-italicised unless any item has manual emphasis set.',
        condition: (_, siblingData) => siblingData.variant !== 'images',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'emphasis',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Italic + accent colour. Setting this on any item disables auto-italicise.',
          },
        },
      ],
    },
    {
      name: 'logos',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Client logos to scroll.',
        condition: (_, siblingData) => siblingData.variant === 'images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          admin: { description: 'Alt text override (falls back to the media file alt)' },
        },
      ],
    },
  ],
}
