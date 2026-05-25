import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TwitterApi } from 'twitter-api-v2'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('twitter_oauth_state')?.value
  const codeVerifier = cookieStore.get('twitter_code_verifier')?.value
  cookieStore.delete('twitter_oauth_state')
  cookieStore.delete('twitter_code_verifier')
  cookieStore.delete('twitter_csrf')

  if (!code || !state || state !== savedState || !codeVerifier) {
    return new NextResponse('OAuth failed: invalid or missing state.', { status: 400 })
  }

  const clientId = process.env.TWITTER_CLIENT_ID
  const clientSecret = process.env.TWITTER_CLIENT_SECRET
  const redirectUri = process.env.TWITTER_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse('Twitter OAuth is not configured.', { status: 500 })
  }

  const client = new TwitterApi({ clientId, clientSecret })

  const {
    client: userClient,
    accessToken,
    refreshToken,
    expiresIn,
  } = await client.loginWithOAuth2({ code, codeVerifier, redirectUri })

  const me = await userClient.v2.me()
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  const payload = await getPayload({ config: configPromise })
  await payload.updateGlobal({
    slug: 'social-settings',
    data: {
      twitter: {
        accessToken,
        refreshToken: refreshToken ?? null,
        expiresAt,
        userId: me.data.id,
        username: me.data.username,
      },
    },
  })

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<body>
<script>
  window.opener?.postMessage('twitter-connected', window.location.origin);
  window.close();
</script>
<p>Twitter / X connected! You can close this window.</p>
</body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  )
}
