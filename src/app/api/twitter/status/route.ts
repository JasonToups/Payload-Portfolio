import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TwitterApi } from 'twitter-api-v2'

type TwitterSettingsData = {
  accessToken?: string | null
  refreshToken?: string | null
  expiresAt?: string | null
  userId?: string | null
  username?: string | null
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = (await payload.findGlobal({
      slug: 'twitter-settings',
    })) as unknown as TwitterSettingsData

    if (!settings.accessToken) {
      return NextResponse.json({ connected: false })
    }

    const isExpired = settings.expiresAt ? new Date(settings.expiresAt) <= new Date() : false

    // Token is valid — connected
    if (!isExpired) {
      return NextResponse.json({ connected: true })
    }

    // Token expired but we have a refresh token — attempt refresh
    if (settings.refreshToken) {
      const clientId = process.env.TWITTER_CLIENT_ID
      const clientSecret = process.env.TWITTER_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        return NextResponse.json({ connected: false })
      }

      const refreshClient = new TwitterApi({ clientId, clientSecret })
      const { accessToken, refreshToken, expiresIn } = await refreshClient.refreshOAuth2Token(
        settings.refreshToken,
      )
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

      await payload.updateGlobal({
        slug: 'twitter-settings',
        data: { accessToken, refreshToken: refreshToken ?? null, expiresAt },
      })

      return NextResponse.json({ connected: true })
    }

    return NextResponse.json({ connected: false })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
