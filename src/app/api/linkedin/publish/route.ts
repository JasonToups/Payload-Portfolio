import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { type SocialPlatform } from '@/utilities/buildShareUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { publishLinkedIn } from '@/lib/social/publishLinkedIn'

type PublishRequest = {
  postId: number
  text: string
  url: string
  title: string
  description?: string
  imageUrl?: string
}

type LinkedInSettingsData = {
  accessToken?: string | null
  expiresAt?: string | null
  personUrn?: string | null
}

type ExistingShare = {
  platform: SocialPlatform
  sharedAt: string
  shareUrl?: string | null
  id?: string | null
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as PublishRequest
  const { postId, text, url, title, description, imageUrl } = body

  if (!postId || !text || !url || !title) {
    return NextResponse.json({ error: 'postId, text, url, and title are required.' }, { status: 400 })
  }

  const settings = (await payload.findGlobal({
    slug: 'linkedin-settings',
  })) as unknown as LinkedInSettingsData

  if (!settings.accessToken || !settings.personUrn) {
    return NextResponse.json(
      { error: 'LinkedIn is not connected. Use the Connect LinkedIn button first.' },
      { status: 403 },
    )
  }

  let shareUrl: string
  try {
    const absoluteImageUrl = imageUrl
      ? imageUrl.startsWith('http')
        ? imageUrl
        : `${getServerSideURL()}${imageUrl}`
      : undefined

    const result = await publishLinkedIn({
      body: text,
      url,
      title,
      description,
      imageUrl: absoluteImageUrl,
      settings: {
        accessToken: settings.accessToken,
        personUrn: settings.personUrn,
        expiresAt: settings.expiresAt,
      },
    })
    shareUrl = result.url
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'LinkedIn publish failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const post = await payload.findByID({ collection: 'posts', id: postId, depth: 0 })
  const existingShares = ((post.socialShares ?? []) as ExistingShare[])

  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      socialShares: [
        ...existingShares,
        {
          platform: 'linkedin',
          sharedAt: new Date().toISOString(),
          shareUrl,
        },
      ],
    },
  })

  return NextResponse.json({ success: true })
}
