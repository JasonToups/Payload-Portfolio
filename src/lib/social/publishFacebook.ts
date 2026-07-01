const GRAPH_BASE = 'https://graph.facebook.com/v21.0'

type FacebookSettings = {
  pageAccessToken: string
  pageId: string
  expiresAt?: string | null
}

type PublishFacebookOptions = {
  message: string
  /** Optional external link — Facebook renders a link preview for feed posts. */
  link?: string
  imageUrls?: string[]
  settings: FacebookSettings
}

type FacebookPostResponse = { id?: string; post_id?: string }
type FacebookPhotoResponse = { id: string; post_id?: string }

async function postForm(
  path: string,
  params: Record<string, string>,
  accessToken: string,
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams({ ...params, access_token: accessToken })
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    throw new Error(`Facebook publish error: ${await res.text()}`)
  }
  return (await res.json()) as Record<string, unknown>
}

/**
 * Force Facebook to (re-)scrape a URL's Open Graph tags before we post it, so the link-preview
 * card renders promptly and any stale/failed cache self-heals. Fails soft — Facebook will also
 * scrape on its own eventually, so a failure here must never block publishing.
 */
async function warmOgCache(url: string, accessToken: string): Promise<void> {
  try {
    await fetch(
      `${GRAPH_BASE}/?id=${encodeURIComponent(url)}&scrape=true&access_token=${encodeURIComponent(accessToken)}`,
      { method: 'POST' },
    )
  } catch {
    /* non-critical */
  }
}

/**
 * Remove the post URL from the message body when it also rides in the `link` param, so the post
 * shows the rich preview card rather than a redundant bare URL. Matches the link with or without
 * a trailing slash and collapses the whitespace/blank line it leaves behind.
 */
function stripUrlFromMessage(message: string, link: string): string {
  const escaped = link.replace(/\/+$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return message
    .replace(new RegExp(`${escaped}/?`, 'g'), '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Publish to a Facebook Page via the Graph API. Unlike Threads/Instagram, Page feed and
 * photo posts complete in a single call (no container polling):
 *  - text / link  → POST /{pageId}/feed
 *  - 1 image      → POST /{pageId}/photos (caption = message)
 *  - 2+ images    → upload each unpublished, then POST /{pageId}/feed with attached_media
 */
export async function publishFacebook(options: PublishFacebookOptions): Promise<{ url: string }> {
  const { message, link, imageUrls = [], settings } = options
  const { pageAccessToken, pageId, expiresAt } = settings

  if (expiresAt && new Date(expiresAt) <= new Date()) {
    throw new Error('Facebook token has expired. Re-authorize from the admin panel.')
  }

  // Single image — post directly to /photos with the message as caption.
  if (imageUrls.length === 1) {
    const data = (await postForm(
      `${pageId}/photos`,
      { url: imageUrls[0], caption: message },
      pageAccessToken,
    )) as FacebookPhotoResponse
    const postId = data.post_id ?? data.id
    return { url: `https://www.facebook.com/${postId}` }
  }

  // Multiple images — upload each unpublished, then a single feed post attaching them.
  if (imageUrls.length > 1) {
    const mediaFbids = await Promise.all(
      imageUrls.map(async (url) => {
        const data = (await postForm(
          `${pageId}/photos`,
          { url, published: 'false' },
          pageAccessToken,
        )) as FacebookPhotoResponse
        return data.id
      }),
    )
    const params: Record<string, string> = { message }
    mediaFbids.forEach((fbid, i) => {
      params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: fbid })
    })
    const data = (await postForm(`${pageId}/feed`, params, pageAccessToken)) as FacebookPostResponse
    return { url: `https://www.facebook.com/${data.id ?? data.post_id}` }
  }

  // Text-only or link post. For link posts the URL rides only in the `link` param so Facebook
  // builds the rich preview card — strip any duplicate of it from the message text, which would
  // otherwise render as a bare inline URL and can suppress the card.
  const params: Record<string, string> = { message }
  if (link) {
    params.message = stripUrlFromMessage(message, link)
    params.link = link
    await warmOgCache(link, pageAccessToken)
  }
  const data = (await postForm(`${pageId}/feed`, params, pageAccessToken)) as FacebookPostResponse
  return { url: `https://www.facebook.com/${data.id ?? data.post_id}` }
}
