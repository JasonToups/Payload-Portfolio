import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const appId = process.env.THREADS_APP_ID
  const redirectUri = process.env.THREADS_REDIRECT_URI

  if (!appId || !redirectUri) {
    return new NextResponse('Threads OAuth is not configured.', { status: 500 })
  }

  const state = randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('threads_oauth_state', state, {
    httpOnly: true,
    maxAge: 600,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'threads_basic,threads_content_publish',
    response_type: 'code',
    state,
  })

  return NextResponse.redirect(`https://threads.net/oauth/authorize?${params.toString()}`)
}
