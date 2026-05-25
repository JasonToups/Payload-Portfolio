import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { BskyAgent } from '@atproto/api'
import type { SocialSetting } from '@/payload-types'

function extractBlueSkyHandle(profiles: SocialSetting['profiles']): string | null {
  const entry = profiles?.find((p) => p.platform === 'bluesky')
  if (!entry?.url) return null
  try {
    // https://bsky.app/profile/handle.bsky.social → "handle.bsky.social"
    const segments = new URL(entry.url).pathname.split('/').filter(Boolean)
    return segments[1] ?? null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appPassword = process.env.BLUESKY_APP_PASSWORD
  if (!appPassword) {
    return NextResponse.json({ connected: false })
  }

  const socialSettings = (await payload.findGlobal({ slug: 'social-settings' })) as SocialSetting
  const handle = extractBlueSkyHandle(socialSettings.profiles)

  if (!handle) {
    return NextResponse.json({ connected: false })
  }

  try {
    const agent = new BskyAgent({ service: 'https://bsky.social' })
    await agent.login({ identifier: handle, password: appPassword })
    return NextResponse.json({ connected: true, handle })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
