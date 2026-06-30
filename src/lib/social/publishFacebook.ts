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

  // Text-only or link post.
  const params: Record<string, string> = { message }
  if (link) params.link = link
  const data = (await postForm(`${pageId}/feed`, params, pageAccessToken)) as FacebookPostResponse
  return { url: `https://www.facebook.com/${data.id ?? data.post_id}` }
}
