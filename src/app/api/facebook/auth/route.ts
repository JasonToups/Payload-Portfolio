import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET() {
  // Facebook and Threads share one Meta app, so the App ID/Secret are the same — fall back
  // to the Threads credentials. Only the redirect URI is Facebook-specific.
  const appId = process.env.FACEBOOK_APP_ID ?? process.env.THREADS_APP_ID
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI

  if (!appId || !redirectUri) {
    return new NextResponse('Facebook OAuth is not configured.', { status: 500 })
  }

  const state = randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('facebook_oauth_state', state, {
    httpOnly: true,
    maxAge: 600,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
    response_type: 'code',
    state,
  })

  return NextResponse.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`)
}
