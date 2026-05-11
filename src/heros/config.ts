import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Kinetic',
          value: 'kinetic',
        },
        {
          label: 'Landing (Amber)',
          value: 'landingImpact',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: false,
    },
    // ── Kinetic hero fields ───────────────────────────────────────────────
    {
      name: 'eyebrow',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'kinetic',
        description: 'Short label left of the rule, e.g. "NOW HIRING ME — INDEX"',
      },
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'kinetic',
        description: 'Version stamp right of the rule, e.g. "v.26.05.07"',
      },
    },
    {
      name: 'headline',
      type: 'group',
      admin: {
        condition: (_, { type } = {}) => type === 'kinetic',
      },
      fields: [
        { name: 'before', type: 'text', admin: { description: 'e.g. "I build"' } },
        { name: 'emphasis', type: 'text', admin: { description: 'Italic accent word, e.g. "software"' } },
        { name: 'middle', type: 'text', admin: { description: 'e.g. "that earns its place on the"' } },
        {
          name: 'rotatingWords',
          type: 'array',
          maxRows: 3,
          admin: { description: 'Up to 3 words that cycle in the headline' },
          fields: [
            { name: 'word', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'manifesto',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      admin: {
        condition: (_, { type } = {}) => type === 'kinetic',
        description: 'Short body copy shown left of the CTAs',
      },
    },
  ],
  label: false,
}
