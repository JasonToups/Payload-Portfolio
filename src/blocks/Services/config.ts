import type { Block } from 'payload'
import { lexicalEditor, FixedToolbarFeature, InlineToolbarFeature } from '@payloadcms/richtext-lexical'

const descriptionRichText = {
  name: 'description',
  type: 'richText' as const,
  editor: lexicalEditor({
    features: ({ rootFeatures }) => [
      ...rootFeatures,
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  }),
}

export const Services: Block = {
  slug: 'services',
  interfaceName: 'ServicesBlock',
  labels: {
    singular: 'Services',
    plural: 'Services Blocks',
  },
  fields: [
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'list',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Bento', value: 'bento' },
      ],
    },
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'What I do',
    },
    descriptionRichText,
    // ── List layout ───────────────────────────────────────────────────────
    {
      name: 'services',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      admin: {
        condition: (_, { layout } = {}) => !layout || layout === 'list',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        { ...descriptionRichText, required: true },
      ],
    },
    // ── Bento layout ──────────────────────────────────────────────────────
    {
      name: 'tiles',
      type: 'array',
      admin: {
        condition: (_, { layout } = {}) => layout === 'bento',
        description: 'Add service, CTA, or "Currently Building" tiles to the bento grid.',
      },
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          options: [
            { label: 'Service', value: 'service' },
            { label: 'CTA', value: 'cta' },
            { label: 'Currently Building', value: 'currentlyBuilding' },
          ],
        },
        // ── Service tile fields ─────────────────────────────────────────
        {
          name: 'number',
          type: 'text',
          admin: {
            condition: (_, { kind } = {}) => kind === 'service',
            description: 'e.g. "01 / COMPANY IMPACT"',
          },
        },
        {
          name: 'title',
          type: 'text',
          admin: {
            condition: (_, { kind } = {}) => kind === 'service',
          },
        },
        { ...descriptionRichText, admin: { condition: (_, { kind } = {}) => kind === 'service' } },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'span-2',
          options: [
            { label: 'Half (2 cols)', value: 'span-2' },
            { label: 'Wide (4 cols)', value: 'span-4' },
          ],
          admin: {
            condition: (_, { kind } = {}) => kind === 'service',
          },
        },
        {
          name: 'tags',
          type: 'array',
          admin: {
            condition: (_, { kind } = {}) => kind === 'service',
          },
          fields: [
            { name: 'label', type: 'text', required: true },
          ],
        },
        // ── CTA tile fields ─────────────────────────────────────────────
        {
          name: 'cta',
          type: 'group',
          admin: {
            condition: (_, { kind } = {}) => kind === 'cta',
          },
          fields: [
            { name: 'eyebrow', type: 'text', admin: { description: 'e.g. "— Book a slot"' } },
            { name: 'availability', type: 'text', admin: { description: 'e.g. "3 SLOTS · MAY"' } },
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'textarea' },
            { name: 'buttonLabel', type: 'text' },
            { name: 'buttonHref', type: 'text' },
          ],
        },
        // ── Currently Building tile fields ──────────────────────────────
        {
          name: 'building',
          type: 'group',
          admin: {
            condition: (_, { kind } = {}) => kind === 'currentlyBuilding',
          },
          fields: [
            { name: 'eyebrow', type: 'text', admin: { description: 'e.g. "— Currently building"' } },
            { name: 'liveLabel', type: 'text', admin: { description: 'e.g. "LIVE · WK 19"' } },
            { name: 'heading', type: 'text' },
            {
              name: 'checklist',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'done', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
      ],
    },
  ],
}
