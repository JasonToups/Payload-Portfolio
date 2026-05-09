import type { Media, Post } from '../payload-types'
import { getServerSideURL } from '../utilities/getURL'
import { resolvePayloadImageUrl } from '../utilities/blobUrl'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}.${dd}.${yy}`
}

export function renderPostCard(post: Post, preview = false): string {
  const postUrl = `${getServerSideURL()}/posts/${post.slug ?? ''}`
  const imageUrl: string | null =
    resolvePayloadImageUrl(post.meta?.image as Media | null | undefined, {
      size: 'small',
      preview,
      email: !preview,
    }) ??
    resolvePayloadImageUrl(post.heroImage as Media | null | undefined, {
      size: 'small',
      preview,
      email: !preview,
    })
  const description = post.meta?.description ?? null
  const publishedAt = post.publishedAt ? formatDate(post.publishedAt) : null

  const dateHtml = publishedAt
    ? `<p style="margin:0 0 8px;font-size:11px;color:#9a9590;font-family:'Courier New',Courier,monospace;letter-spacing:0.1em;text-transform:uppercase;">${publishedAt}</p>`
    : ''

  const descriptionHtml = description
    ? `<p style="margin:8px 0 0;font-size:14px;color:#7a7570;line-height:1.5;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;">${description}</p>`
    : ''

  const readMoreHtml = `<p style="margin:14px 0 0;font-size:11px;font-family:'Courier New',Courier,monospace;letter-spacing:0.1em;"><a href="${postUrl}" style="color:#2d7a95;text-decoration:none;text-transform:uppercase;">Read article →</a></p>`

  const thumbCell = imageUrl
    ? `<td width="120" valign="top" style="width:120px;padding:0;vertical-align:top;">
        <a href="${postUrl}" style="display:block;text-decoration:none;">
          <img src="${imageUrl}" alt="${post.title}" width="120" height="120" style="display:block;width:120px;height:120px;object-fit:cover;" />
        </a>
      </td>`
    : ''

  const contentPadding = imageUrl ? '16px 20px 18px' : '18px 22px 20px'

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border:1px solid #e2ddd6;border-radius:8px;overflow:hidden;margin-bottom:14px;background-color:#ffffff;">
  <tr valign="top">
    ${thumbCell}
    <td valign="top" style="padding:${contentPadding};vertical-align:top;">
      ${dateHtml}
      <h2 style="margin:0;font-size:17px;font-weight:700;line-height:1.25;font-family:'Spectral',Georgia,'Times New Roman',serif;">
        <a href="${postUrl}" style="color:#1e1c18;text-decoration:none;">${post.title}</a>
      </h2>
      ${descriptionHtml}
      ${readMoreHtml}
    </td>
  </tr>
</table>`
}
