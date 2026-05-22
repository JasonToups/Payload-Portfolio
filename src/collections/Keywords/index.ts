import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { toSlug } from '../../utilities/toSlug'

export const Keywords: CollectionConfig = {
  slug: 'keywords',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated URL-safe identifier from the keyword name.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const name = typeof data.name === 'string' ? data.name : originalDoc?.name
        if (typeof name === 'string') {
          data.name = name.trim().toLowerCase()
          data.slug = toSlug(data.name)
        }
        return data
      },
    ],
  },
}
