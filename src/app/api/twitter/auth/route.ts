import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'

export async function GET() {
  const clientId = process.env.TWITTER_CLIENT_ID
  const clientSecret = process.env.TWITTER_CLIENT_SECRET
  const redirectUri = process.env.TWITTER_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Twitter OAuth is not configured.' }, { status: 500 })
  }

  const client = new TwitterApi({ clientId, clientSecret })

  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(redirectUri, {
    scope: ['tweet.write', 'users.read', 'offline.access'],
  })

  const cookieStore = await cookies()
  cookieStore.set('twitter_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  cookieStore.set('twitter_code_verifier', codeVerifier, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  // Use a temporary state for CSRF; twitter-api-v2 generates its own state token
  const csrfState = crypto.randomBytes(8).toString('hex')
  cookieStore.set('twitter_csrf', csrfState, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return NextResponse.redirect(url)
}
