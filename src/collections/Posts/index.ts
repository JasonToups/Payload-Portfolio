import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { BlockQuote } from '../../blocks/BlockQuote/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'
import { syncContentToMetaDescription } from './hooks/syncContentToMetaDescription'
import { syncHeroToMetaImage } from './hooks/syncHeroToMetaImage'
import { syncMetaTitle } from './hooks/syncMetaTitle'
import { syncTitleToSlug } from './hooks/syncTitleToSlug'
import { validateSlug } from './hooks/validateSlug'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'
import type { TextField } from 'payload'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    postDescription: true,
    slug: true,
    categories: true,
    keywords: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'socialShares', 'broadcasts', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        components: {
          Field: '@/collections/Posts/components/PostTitleField',
        },
      },
    },
    {
      name: 'postDescription',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Displayed in the post hero. Auto-syncs to meta description.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Post',
      defaultValue: false,
      admin: {
        description:
          'Show this post as the Featured Post on the Posts page. Only the most recently created featured post will be shown.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, BlockQuote, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineCodeFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: 'Body',
              required: true,
            },
            {
              name: 'keywords',
              type: 'relationship',
              relationTo: 'keywords',
              hasMany: true,
              admin: {
                position: 'sidebar',
                components: {
                  Field: '@/collections/Posts/components/KeywordsInputField',
                },
              },
            },
            {
              name: 'keywordFrequency',
              type: 'ui',
              admin: {
                position: 'sidebar',
                components: {
                  Field: '@/collections/Posts/components/KeywordFrequencyField',
                },
              },
            },
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                sortOptions: '-createdAt',
                description:
                  'Manually select related posts. If left empty, related posts are chosen automatically by keyword and category.',
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'includeRelatedPosts',
              type: 'checkbox',
              defaultValue: true,
              label: 'Include Related Posts',
              admin: {
                position: 'sidebar',
                description:
                  'When enabled, 3 related posts are automatically selected by keyword and category. Uncheck to hide the related posts section entirely.',
                condition: (data) => {
                  const posts = data?.relatedPosts
                  return !posts || (Array.isArray(posts) && posts.length === 0)
                },
              },
            },
            {
              name: 'authors',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'users',
            },
            // This field is only used to populate the user data via the `populateAuthors` hook
            // This is because the `user` collection has access control locked to protect user privacy
            // GraphQL will also not return mutated user data that differs from the underlying schema
            {
              name: 'populatedAuthors',
              type: 'array',
              access: {
                update: () => false,
              },
              admin: {
                disabled: true,
                readOnly: true,
              },
              fields: [
                {
                  name: 'id',
                  type: 'text',
                },
                {
                  name: 'name',
                  type: 'text',
                },
              ],
            },
            slugField({
              overrides: (field) => {
                const slugTextField = field.fields[1] as TextField
                slugTextField.admin = {
                  ...slugTextField.admin,
                  components: {
                    Field: {
                      clientProps: { useAsSlug: 'title' },
                      path: '@/collections/Posts/components/PostSlugField',
                    },
                  },
                }
                slugTextField.validate = validateSlug
                return field
              },
            }),
            {
              name: 'publishedAt',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
                position: 'sidebar',
              },
              hooks: {
                beforeChange: [
                  ({ siblingData, value, originalDoc }) => {
                    if (siblingData._status === 'published' && !value) {
                      return originalDoc?.publishedAt ?? new Date()
                    }
                    return value
                  },
                ],
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({
              hasGenerateFn: true,
            }),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
            {
              name: 'socialPreview',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/collections/Posts/components/SocialPreviewField',
                },
              },
            },
          ],
        },
        {
          fields: [
            {
              name: 'draftBroadcastButton',
              type: 'ui',
              admin: {
                position: 'sidebar',
                components: {
                  Field: '@/collections/Posts/components/DraftBroadcastButton',
                },
              },
            },
            {
              name: 'broadcasts',
              type: 'join',
              collection: 'broadcasts',
              on: 'posts',
              admin: {
                condition: () => false,
                components: {
                  Cell: '@/collections/Posts/components/BroadcastCell',
                },
              },
            },
          ],
          label: 'Broadcast',
        },
        {
          label: 'Share',
          fields: [
            {
              name: 'socialPostBody',
              type: 'textarea',
              label: 'Social Post Body',
              admin: {
                components: {
                  Field: '@/collections/Posts/components/DebouncedSocialPostBody',
                },
              },
            },
            {
              name: 'socialShareActions',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/collections/Posts/components/SocialShareButton',
                },
              },
            },
            {
              name: 'socialShares',
              type: 'array',
              label: 'Share History',
              admin: {
                description: 'Record of social media shares for this post',
                components: {
                  Cell: '@/collections/Posts/components/SocialSharesCell',
                },
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  label: 'Platform',
                  required: true,
                  options: [
                    { label: 'Twitter / X', value: 'twitter' },
                    { label: 'Threads', value: 'threads' },
                    { label: 'BlueSky', value: 'bluesky' },
                    { label: 'LinkedIn', value: 'linkedin' },
                  ],
                },
                {
                  name: 'sharedAt',
                  type: 'date',
                  label: 'Shared At',
                  required: true,
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                  },
                },
                {
                  name: 'shareUrl',
                  type: 'text',
                  label: 'Share URL',
                  admin: {
                    description: 'Optional: URL of the published social post',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      syncHeroToMetaImage,
      syncMetaTitle,
      syncContentToMetaDescription,
      syncTitleToSlug,
    ],
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
