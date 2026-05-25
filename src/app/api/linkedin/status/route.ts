import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type SocialSettingsLinkedIn = {
  linkedin?: { accessToken?: string | null; expiresAt?: string | null } | null
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
    })) as unknown as SocialSettingsLinkedIn

    const li = settings.linkedin
    const connected =
      Boolean(li?.accessToken) && Boolean(li?.expiresAt) && new Date(li!.expiresAt!) > new Date()

    return NextResponse.json({ connected })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
