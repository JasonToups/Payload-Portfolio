import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type ThreadsSettingsData = {
  accessToken?: string | null
  userId?: string | null
  expiresAt?: string | null
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
      slug: 'threads-settings',
    })) as unknown as ThreadsSettingsData

    if (!settings.accessToken || !settings.userId) {
      return NextResponse.json({ connected: false })
    }

    const isExpired = settings.expiresAt && new Date(settings.expiresAt) <= new Date()

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
