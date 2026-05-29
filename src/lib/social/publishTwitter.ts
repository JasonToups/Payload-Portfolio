import { TwitterApi } from 'twitter-api-v2'

type TwitterPublishSettings = {
  accessToken: string
  refreshToken?: string | null
  expiresAt?: string | null
  username?: string | null
}

type PublishTwitterOptions = {
  body: string
  postUrl: string
  imageUrls?: string[]
  settings: TwitterPublishSettings
}

const TWITTER_MAX_IMAGES = 4

type TwitterMediaIds =
  | [string]
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]

async function uploadMediaToTwitter(
  client: TwitterApi,
  imageUrl: string,
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) {
      console.error('Twitter image fetch failed:', res.status, imageUrl)
      return null
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg'
    return await client.v1.uploadMedia(buffer, { mimeType })
  } catch (err) {
    console.error('Twitter media upload failed:', err)
    return null
  }
}

export async function publishTwitter(options: PublishTwitterOptions): Promise<{ url: string }> {
  const { body, postUrl, imageUrls = [], settings } = options

  let token = settings.accessToken

  // Auto-refresh if the token is expired
  if (settings.expiresAt && new Date(settings.expiresAt) <= new Date() && settings.refreshToken) {
    const clientId = process.env.TWITTER_CLIENT_ID
    const clientSecret = process.env.TWITTER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Twitter client credentials are not configured.')
    }

    const refreshClient = new TwitterApi({ clientId, clientSecret })
    const refreshed = await refreshClient.refreshOAuth2Token(settings.refreshToken)
    token = refreshed.accessToken
  }

  const client = new TwitterApi(token)

  // Append post URL — Twitter t.co shortens all URLs to 23 chars
  const tweetText = `${body}\n\n${postUrl}`

  // Upload up to 4 images in parallel
  const imagesToUpload = imageUrls.slice(0, TWITTER_MAX_IMAGES)
  const mediaIds = imagesToUpload.length
    ? (await Promise.all(imagesToUpload.map((url) => uploadMediaToTwitter(client, url)))).filter(
        (id): id is string => id !== null,
      )
    : []

  const tweet = await client.v2.tweet({
    text: tweetText,
    ...(mediaIds.length ? { media: { media_ids: mediaIds as TwitterMediaIds } } : {}),
  })

  const tweetId = tweet.data.id
  const url = settings.username
    ? `https://x.com/${settings.username}/status/${tweetId}`
    : `https://x.com/i/web/status/${tweetId}`

  return { url }
}
