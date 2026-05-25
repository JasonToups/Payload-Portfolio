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
  settings: TwitterPublishSettings
}

export async function publishTwitter(options: PublishTwitterOptions): Promise<{ url: string }> {
  const { body, postUrl, settings } = options

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
  const tweet = await client.v2.tweet(tweetText)

  const tweetId = tweet.data.id
  const url = settings.username
    ? `https://x.com/${settings.username}/status/${tweetId}`
    : `https://x.com/i/web/status/${tweetId}`

  return { url }
}
