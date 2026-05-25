import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type SocialSettingsThreads = {
  threads?: { accessToken?: string | null; userId?: string | null; expiresAt?: string | null } | null
}

type ThreadsRefreshResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = (await payload.findGlobal({
      slug: 'social-settings',
    })) as unknown as SocialSettingsThreads

    const th = settings.threads
    if (!th?.accessToken || !th?.userId) {
      return NextResponse.json({ connected: false })
    }

    const isExpired = th.expiresAt && new Date(th.expiresAt) <= new Date()

    if (!isExpired) {
      return NextResponse.json({ connected: true })
    }

    // Token is expired — Threads long-lived tokens can only be refreshed while still valid.
    // If we're here, the token has already expired and re-authorization is required.
    return NextResponse.json({ connected: false })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
