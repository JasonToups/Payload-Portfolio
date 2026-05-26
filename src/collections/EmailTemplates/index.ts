import type { CollectionConfig } from 'payload'

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    group: 'Email',
    useAsTitle: 'name',
    defaultColumns: ['name', 'templateType', 'isDefault', 'updatedAt'],
    description: 'Configure reusable email templates for broadcasts and welcome emails.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for this template (e.g. "Weekly Digest – Tech").',
      },
    },
    {
      name: 'templateType',
      type: 'select',
      required: true,
      options: [
        { label: 'Single Post', value: 'single_post' },
        { label: 'Weekly Digest', value: 'weekly_digest' },
        { label: 'Category Digest', value: 'category_digest' },
        { label: 'Keyword Digest', value: 'keyword_digest' },
        { label: 'Welcome Email', value: 'welcome_email' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Determines the broadcast type and which auto-pull options are available.',
      },
    },
    // -------------------------------------------------------------------------
    // Header Layout — overrides the EmailLayout global header per-field.
    // Empty string means "use global fallback."
    // -------------------------------------------------------------------------
    {
      name: 'headerLayout',
      label: 'Header Layout',
      type: 'group',
      admin: {
        description:
          'Override the global email header for this template. Leave a field blank to inherit the global default.',
      },
      fields: [
        {
          name: 'logo',
          label: 'Logo',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Overrides the global header logo. Recommended size: 200×60px.',
          },
        },
        {
          name: 'tagline',
          label: 'Tagline',
          type: 'text',
          required: false,
          admin: {
            description: 'Overrides the global header tagline.',
          },
        },
        {
          name: 'bgColor',
          label: 'Background Color',
          type: 'text',
          required: false,
          admin: {
            description: 'Hex color for the header background (e.g. #ffffff). Leave blank to use global.',
          },
        },
        {
          name: 'textColor',
          label: 'Text Color',
          type: 'text',
          required: false,
          admin: {
            description: 'Hex color for header text (e.g. #000000). Leave blank to use global.',
          },
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Auto-Pull Settings — type-conditional content sourcing
    // -------------------------------------------------------------------------
    {
      name: 'autoPull',
      label: 'Auto-Pull Settings',
      type: 'group',
      admin: {
        description: 'Configure automatic post fetching when a broadcast using this template is created.',
      },
      fields: [
        {
          name: 'autoPullEnabled',
          label: 'Auto-Pull This Week\'s Posts',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'When on, new Weekly Digest broadcasts will automatically pull posts from the last 7 days.',
            condition: (data) => data?.templateType === 'weekly_digest',
          },
        },
        {
          name: 'categorySource',
          label: 'Category Source',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: false,
          required: false,
          admin: {
            description: 'Pull the most recent published posts from this category.',
            condition: (data) => data?.templateType === 'category_digest',
          },
        },
        {
          name: 'keywordSource',
          label: 'Keyword Source',
          type: 'relationship',
          relationTo: 'keywords',
          hasMany: false,
          required: false,
          admin: {
            description: 'Pull the most recent published posts tagged with this keyword.',
            condition: (data) => data?.templateType === 'keyword_digest',
          },
        },
        {
          name: 'autoPullCount',
          label: 'Number of Posts to Pull',
          type: 'number',
          defaultValue: 3,
          min: 1,
          max: 50,
          admin: {
            description: 'How many posts to auto-pull (max 50).',
            condition: (data) =>
              data?.templateType === 'category_digest' || data?.templateType === 'keyword_digest',
          },
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Audience Targeting — maps to Resend topic for sends
    // -------------------------------------------------------------------------
    {
      name: 'audienceTargeting',
      label: 'Audience Targeting',
      type: 'group',
      fields: [
        {
          name: 'audienceTopic',
          label: 'Audience Topic',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: false,
          required: false,
          admin: {
            description:
              'Target a specific Resend topic (Post Category). Leave empty to send to the full audience.',
          },
        },
      ],
    },
  ],
}
