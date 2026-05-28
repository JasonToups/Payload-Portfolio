import type { CollectionConfig } from 'payload'

export const Resume: CollectionConfig = {
  slug: 'resumes',
  labels: { singular: 'Resume', plural: 'Resumes' },
  versions: { drafts: true },
  access: { read: () => true },
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['description', 'author', 'updatedAt', '_status'],
    livePreview: {
      url: () => {
        const params = new URLSearchParams({
          path: '/resume',
          collection: 'resumes',
          previewSecret: process.env.PREVIEW_SECRET || '',
        })
        return `/next/preview?${params.toString()}`
      },
    },
    preview: () => {
      const params = new URLSearchParams({
        path: '/resume',
        collection: 'resumes',
        previewSecret: process.env.PREVIEW_SECRET || '',
      })
      return `/next/preview?${params.toString()}`
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      admin: {
        description: 'Internal note about what changed in this version. Shown in the admin list view.',
      },
    },
    {
      name: 'author',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        rows: 30,
        description: 'Raw Markdown — not a rich text editor.',
      },
    },
    {
      name: 'downloadPanel',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/Resume/components/ResumeDownloadPanel',
        },
      },
    },
  ],
}
