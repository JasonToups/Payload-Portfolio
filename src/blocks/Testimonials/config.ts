import type { Block } from 'payload'

export const Testimonials: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: {
    singular: 'Testimonials',
    plural: 'Testimonials Blocks',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: '— Receipts',
      admin: { description: 'Small label above the heading, e.g. "— Receipts"' },
    },
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'What people say',
    },
    {
      name: 'body',
      type: 'textarea',
      admin: { description: 'Subtext shown to the right of the heading' },
    },
    {
      name: 'testimonials',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
        },
        {
          name: 'author',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'company',
          type: 'text',
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Renders this quote with a primary-color background as the focal card' },
        },
      ],
    },
  ],
}
