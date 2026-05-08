import type { Block } from 'payload'

export const Skills: Block = {
  slug: 'skills',
  interfaceName: 'SkillsBlock',
  labels: {
    singular: 'Skills',
    plural: 'Skills Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'My stack',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'categories',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'items',
          type: 'array',
          minRows: 1,
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
