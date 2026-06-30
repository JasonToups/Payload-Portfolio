import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type TokenResponse = {
  access_token: string
  token_type?: string
  expires_in?: number
}

type PagesResponse = {
  data?: Array<{ id: string; name: string; access_token: string }>
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('facebook_oauth_state')?.value
  cookieStore.delete('facebook_oauth_state')

  if (!code || !state || state !== savedState) {
    return new NextResponse('OAuth failed: invalid or missing state.', { status: 400 })
  }

  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI

  if (!appId || !appSecret || !redirectUri) {
    return new NextResponse('Facebook OAuth is not configured.', { status: 500 })
  }

  // Step 1: Exchange code for a short-lived user token
  const shortTokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    }).toString()}`,
  )
  if (!shortTokenRes.ok) {
    return new NextResponse(`Failed to exchange auth code: ${await shortTokenRes.text()}`, {
      status: 500,
    })
  }
  const shortToken = (await shortTokenRes.json()) as TokenResponse

  // Step 2: Exchange for a long-lived user token (~60 days)
  const longTokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken.access_token,
    }).toString()}`,
  )
  if (!longTokenRes.ok) {
    return new NextResponse(`Failed to get long-lived token: ${await longTokenRes.text()}`, {
      status: 500,
    })
  }
  const longToken = (await longTokenRes.json()) as TokenResponse

  // Step 3: Fetch the Pages this user manages — the Page token is what we publish with.
  // Page tokens derived from a long-lived user token are effectively non-expiring.
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?${new URLSearchParams({
      fields: 'id,name,access_token',
      access_token: longToken.access_token,
    }).toString()}`,
  )
  if (!pagesRes.ok) {
    return new NextResponse(`Failed to fetch Facebook Pages: ${await pagesRes.text()}`, {
      status: 500,
    })
  }
  const pages = (await pagesRes.json()) as PagesResponse
  const page = pages.data?.[0]
  if (!page) {
    return new NextResponse('No Facebook Page found for this account.', { status: 400 })
  }

  const expiresAt = longToken.expires_in
    ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
    : null

  const payload = await getPayload({ config: configPromise })
  await payload.updateGlobal({
    slug: 'social-settings',
    data: {
      facebook: {
        pageAccessToken: page.access_token,
        pageId: page.id,
        pageName: page.name,
        expiresAt,
      },
    },
  })

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<body>
<script>
  window.opener?.postMessage('facebook-connected', window.location.origin);
  window.close();
</script>
<p>Facebook connected! You can close this window.</p>
</body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  )
}
