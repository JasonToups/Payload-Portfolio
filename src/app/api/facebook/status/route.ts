import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type SocialSettingsFacebook = {
  facebook?: {
    pageAccessToken?: string | null
    pageId?: string | null
    expiresAt?: string | null
  } | null
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
    })) as unknown as SocialSettingsFacebook

    const fb = settings.facebook
    if (!fb?.pageAccessToken || !fb?.pageId) {
      return NextResponse.json({ connected: false })
    }

    const isExpired = fb.expiresAt && new Date(fb.expiresAt) <= new Date()
    return NextResponse.json({ connected: !isExpired })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
