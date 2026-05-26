import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { Payload } from 'payload'
import type { Broadcast, EmailLayout, EmailTemplate, Post } from '../payload-types'
import { renderEmailTemplate } from './template'
import { renderPostCard } from './renderPostCard'

type AssembleOptions = {
  preview?: boolean
}

function mergeHeaderLayout(
  globalHeader: EmailLayout['header'],
  templateHeader: EmailTemplate['headerLayout'],
): EmailLayout['header'] {
  if (!templateHeader) return globalHeader
  return {
    logo: templateHeader.logo ?? globalHeader?.logo,
    tagline: templateHeader.tagline ?? globalHeader?.tagline,
    bgColor: templateHeader.bgColor || globalHeader?.bgColor,
    textColor: templateHeader.textColor || globalHeader?.textColor,
  }
}

export async function assembleBroadcastEmail(
  payload: Payload,
  broadcast: Broadcast,
  options: AssembleOptions = {},
): Promise<string> {
  const bodyHtml = broadcast.body ? convertLexicalToHTML({ data: broadcast.body }) : ''

  const templateId =
    typeof broadcast.template === 'object' && broadcast.template !== null
      ? (broadcast.template as EmailTemplate).id
      : typeof broadcast.template === 'number'
        ? broadcast.template
        : null

  const [layout, template] = await Promise.all([
    payload.findGlobal({ slug: 'email-layout', depth: 1 }) as Promise<EmailLayout>,
    templateId
      ? (payload.findByID({
          collection: 'email-templates',
          id: templateId,
          depth: 1,
        }) as Promise<EmailTemplate>)
      : Promise.resolve(null),
  ])

  const mergedLayout: EmailLayout = {
    ...layout,
    header: mergeHeaderLayout(layout.header, template?.headerLayout),
  }

  const postCardsHtml = buildPostCardsHtml(broadcast, options.preview ?? false)
  const html = renderEmailTemplate(bodyHtml + postCardsHtml, mergedLayout)

  if (options.preview) {
    return html.replace(
      /href="\{{{RESEND_UNSUBSCRIBE_URL}}}"[^>]*>[^<]*/,
      'href="#">[Unsubscribe — preview only]',
    )
  }

  return html
}

function buildPostCardsHtml(broadcast: Broadcast, preview: boolean): string {
  const tType = broadcast.templateType

  if (tType === 'single_post') {
    const post = broadcast.posts?.[0]
    if (!post || typeof post === 'number') return ''
    return renderPostCard(post as Post, preview)
  }

  if (tType === 'weekly_digest' || tType === 'category_digest' || tType === 'keyword_digest') {
    const posts = broadcast.posts
    if (!posts?.length) return ''
    return posts
      .filter((p): p is Post => typeof p !== 'number')
      .map((p) => renderPostCard(p, preview))
      .join('\n')
  }

  return ''
}
