import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type LinkedInSettingsData = {
  accessToken?: string | null
  expiresAt?: string | null
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = (await payload.findGlobal({
      slug: 'linkedin-settings',
    })) as unknown as LinkedInSettingsData

    const connected =
      Boolean(settings.accessToken) &&
      Boolean(settings.expiresAt) &&
      new Date(settings.expiresAt!) > new Date()

    return NextResponse.json({ connected })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
