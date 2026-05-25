import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { BskyAgent } from '@atproto/api'

type BlueSkySettingsData = {
  handle?: string | null
  appPassword?: string | null
  did?: string | null
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = (await payload.findGlobal({
    slug: 'bluesky-settings',
  })) as unknown as BlueSkySettingsData

  if (!settings.handle || !settings.appPassword) {
    return NextResponse.json({ connected: false })
  }

  try {
    const agent = new BskyAgent({ service: 'https://bsky.social' })
    await agent.login({ identifier: settings.handle, password: settings.appPassword })

    // Persist the DID if not yet stored
    const sessionDid = agent.session?.did
    if (sessionDid && !settings.did) {
      await payload.updateGlobal({
        slug: 'bluesky-settings',
        data: { did: sessionDid },
      })
    }

    return NextResponse.json({ connected: true, handle: settings.handle })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
