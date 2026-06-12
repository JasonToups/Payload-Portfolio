import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateDescription, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Form, FormSubmission, Keyword, Page, Post } from '@/payload-types'

interface FieldWithAdmin {
  admin?: Record<string, unknown>
}
import { getServerSideURL } from '@/utilities/getURL'
import { getSiteSettings } from '@/utilities/getSiteSettings'
import { handleNewsletterSubscribe } from '@/resend'
import { extractLexicalText } from '@/utilities/extractLexicalText'

const generateDescription: GenerateDescription<Post> = ({ doc }) => {
  if (!doc?.content?.root) return ''
  const contentText = extractLexicalText(doc.content.root)
  if (!contentText) return ''

  // In the admin form, relationship fields arrive as populated objects.
  const firstKeyword = doc.keywords?.[0]
  const keywordName =
    firstKeyword && typeof firstKeyword === 'object' && 'name' in firstKeyword
      ? (firstKeyword as Keyword).name
      : null

  const prefix = keywordName ? `${keywordName} — ` : ''
  const available = 155 - prefix.length
  return `${prefix}${contentText.substring(0, available > 0 ? available : 155).trim()}`
}

const generateTitle: GenerateTitle<Post | Page> = async ({ doc }) => {
  // Get the site name from settings to use as prefix
  let siteName = 'Payload Website Template'

  try {
    const settings = await getSiteSettings()
    if (settings?.siteName) {
      siteName = settings.siteName
    }
  } catch (error) {
    // Use default if site settings not available
    console.log(error)
  }

  // If doc has a title, use it with the site name prefix; otherwise fallback to site name
  if (doc?.title) {
    return `${siteName} | ${doc.title}`
  }

  return siteName
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const SUBSCRIBE_FORM_TITLE = 'Subscribe to Newsletter'

export const plugins: Plugin[] = [
  vercelBlobStorage({
    collections: {
      media: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
    clientUploads: true,
  }),
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateDescription,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          // Upgrade the confirmation message editor
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }

          // Hide Form Builder "Emails" UI for the Subscribe form so welcome emails are only sent via Site Settings + Resend.
          if ('name' in field && field.name === 'emails') {
            return {
              ...field,
              admin: {
                ...(field as FieldWithAdmin).admin,
                condition: (data: Record<string, unknown>) => data?.title !== SUBSCRIBE_FORM_TITLE,
                description:
                  'Newsletter welcome emails are configured in Site Settings and sent via Resend. Form emails are disabled for this form to prevent duplicate sends.',
              },
            }
          }

          return field
        })
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            // Hard safety: never allow Form Builder emails for the subscribe form
            const formData = data as { title?: string; emails?: unknown }
            if (formData?.title === SUBSCRIBE_FORM_TITLE) {
              formData.emails = null
            }
            return data
          },
        ],
      },
    },
    formSubmissionOverrides: {
      hooks: {
        afterChange: [
          async ({ doc, req }) => {
            try {
              // Only run on create
              if (req?.method && req.method !== 'POST') return doc

              const submission = doc as FormSubmission

              if (process.env.NODE_ENV !== 'production') {
                console.info('[Forms] form-submission created', {
                  id: submission.id,
                  method: req?.method,
                })
              }

              const formValue: number | Form = submission.form
              let formTitle: string | undefined

              if (formValue && typeof formValue === 'object') {
                formTitle = formValue.title
              } else if (formValue) {
                const formDoc = await req.payload.findByID({
                  collection: 'forms',
                  id: formValue,
                  depth: 0,
                })
                formTitle = formDoc.title
              }

              if (process.env.NODE_ENV !== 'production') {
                console.info('[Forms] resolved formTitle', { formTitle })
              }

              // Tolerant comparison
              if ((formTitle || '').trim() !== SUBSCRIBE_FORM_TITLE) return doc

              const submissionData = submission.submissionData

              // Tolerant email extraction
              let email: string | null = null

              if (Array.isArray(submissionData)) {
                const exact = submissionData.find(
                  (item) => typeof item?.field === 'string' && item.field.toLowerCase() === 'email',
                )

                const loose =
                  exact ||
                  submissionData.find(
                    (item) =>
                      typeof item?.field === 'string' && item.field.toLowerCase().includes('email'),
                  )

                if (typeof loose?.value === 'string') email = loose.value.trim()
              } else if (submissionData && typeof submissionData === 'object') {
                const v =
                  (submissionData as Record<string, unknown>).email ||
                  (submissionData as Record<string, unknown>).Email
                if (typeof v === 'string') email = v.trim()
              }

              if (!email) {
                if (process.env.NODE_ENV !== 'production') {
                  console.warn('[Forms] subscribe submission missing email; skipping', {
                    submissionData,
                  })
                }
                return doc
              }

              const result = await handleNewsletterSubscribe(req.payload, email)

              if (process.env.NODE_ENV !== 'production') {
                console.info('[Forms] newsletter subscribe result', {
                  email,
                  contact: result.contact?.status,
                  segment: result.segment?.status,
                  welcomeEmail: result.welcomeEmail?.status,
                })
              }
            } catch (err) {
              console.warn('[Resend] Failed to create contact from form submission:', err)
            }

            return doc
          },
        ],
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
