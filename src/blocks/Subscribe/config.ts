import type { Block } from 'payload'
import { buttonIconField } from '@/fields/buttonIcon'

/**
 * Subscribe Block
 *
 * This block defines CMS-editable content for a newsletter subscribe form.
 * It can be placed on the Home page, Post layouts, or anywhere blocks are used.
 *
 * The actual subscriber storage lives in the `newsletter-subscribers` collection.
 */
export const Subscribe: Block = {
  slug: 'subscribe',
  interfaceName: 'SubscribeBlock',
  labels: {
    singular: 'Subscribe',
    plural: 'Subscribe Blocks',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: '— Newsletter',
      admin: { description: 'Small label above the heading, e.g. "— Newsletter"' },
    },
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Field notes from the engineer / designer seam.',
    },
    {
      name: 'description',
      type: 'textarea',
      defaultValue:
        'One letter a month on shipping, hiring, and the work that sits between teams. No spam, no ladder content.',
    },
    {
      name: 'placeholder',
      type: 'text',
      defaultValue: 'you@studio.com',
    },
    {
      name: 'buttonText',
      type: 'text',
      defaultValue: 'Subscribe →',
    },
    buttonIconField(),
    {
      name: 'buttonVariant',
      type: 'select',
      defaultValue: 'large',
      admin: { description: 'Visual style of the subscribe button' },
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Large', value: 'large' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Large Secondary', value: 'large-secondary' },
        { label: 'Animated', value: 'animated' },
        { label: 'Destructive', value: 'destructive' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Link', value: 'link' },
        { label: 'Outline', value: 'outline' },
      ],
    },
    {
      name: 'meta',
      type: 'text',
      defaultValue: '827 READERS · MONTHLY · UNSUBSCRIBE WHENEVER',
      admin: { description: 'Stat line shown below the form' },
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'homepage',
      admin: {
        description: 'Stored with the subscriber record (e.g. homepage, post-footer)',
      },
    },
  ],
}
