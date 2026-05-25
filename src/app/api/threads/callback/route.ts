import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type ShortLivedTokenResponse = {
  access_token: string
  token_type: string
}

type LongLivedTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

type ThreadsUserResponse = {
  id: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('threads_oauth_state')?.value
  cookieStore.delete('threads_oauth_state')

  if (!code || !state || state !== savedState) {
    return new NextResponse('OAuth failed: invalid or missing state.', { status: 400 })
  }

  const appId = process.env.THREADS_APP_ID
  const appSecret = process.env.THREADS_APP_SECRET
  const redirectUri = process.env.THREADS_REDIRECT_URI

  if (!appId || !appSecret || !redirectUri) {
    return new NextResponse('Threads OAuth is not configured.', { status: 500 })
  }

  // Step 1: Exchange code for short-lived token
  const shortTokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  })

  if (!shortTokenRes.ok) {
    const body = await shortTokenRes.text()
    return new NextResponse(`Failed to exchange auth code: ${body}`, { status: 500 })
  }

  const shortTokenData = (await shortTokenRes.json()) as ShortLivedTokenResponse

  // Step 2: Exchange short-lived token for long-lived token (60-day expiry)
  const longTokenRes = await fetch(
    `https://graph.threads.net/access_token?${new URLSearchParams({
      grant_type: 'th_exchange_token',
      client_secret: appSecret,
      access_token: shortTokenData.access_token,
    }).toString()}`,
  )

  if (!longTokenRes.ok) {
    const body = await longTokenRes.text()
    return new NextResponse(`Failed to get long-lived token: ${body}`, { status: 500 })
  }

  const longTokenData = (await longTokenRes.json()) as LongLivedTokenResponse

  // Step 3: Fetch the Threads user ID
  const userRes = await fetch(
    `https://graph.threads.net/v1.0/me?fields=id&access_token=${longTokenData.access_token}`,
  )

  if (!userRes.ok) {
    return new NextResponse('Failed to fetch Threads user info.', { status: 500 })
  }

  const userData = (await userRes.json()) as ThreadsUserResponse
  const expiresAt = new Date(Date.now() + longTokenData.expires_in * 1000).toISOString()

  const payload = await getPayload({ config: configPromise })
  await payload.updateGlobal({
    slug: 'social-settings',
    data: {
      threads: {
        accessToken: longTokenData.access_token,
        userId: userData.id,
        expiresAt,
      },
    },
  })

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<body>
<script>
  window.opener?.postMessage('threads-connected', window.location.origin);
  window.close();
</script>
<p>Threads connected! You can close this window.</p>
</body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  )
}
