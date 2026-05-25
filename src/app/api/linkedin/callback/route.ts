import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type TokenResponse = {
  access_token: string
  expires_in: number
}

type UserInfoResponse = {
  sub: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('linkedin_oauth_state')?.value
  cookieStore.delete('linkedin_oauth_state')

  if (!code || !state || state !== savedState) {
    return new NextResponse('OAuth failed: invalid or missing state.', { status: 400 })
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse('LinkedIn OAuth is not configured.', { status: 500 })
  }

  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!tokenRes.ok) {
    const body = await tokenRes.text()
    return new NextResponse(`Failed to exchange auth code: ${body}`, { status: 500 })
  }

  const tokenData = (await tokenRes.json()) as TokenResponse

  const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userInfoRes.ok) {
    return new NextResponse('Failed to fetch LinkedIn user info.', { status: 500 })
  }

  const userInfo = (await userInfoRes.json()) as UserInfoResponse

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
  const personUrn = `urn:li:person:${userInfo.sub}`

  const payload = await getPayload({ config: configPromise })
  await payload.updateGlobal({
    slug: 'social-settings',
    data: { linkedin: { accessToken: tokenData.access_token, expiresAt, personUrn } },
  })

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<body>
<script>
  window.opener?.postMessage('linkedin-connected', window.location.origin);
  window.close();
</script>
<p>LinkedIn connected! You can close this window.</p>
</body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  )
}
