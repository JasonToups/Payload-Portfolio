import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { type SocialPlatform } from '@/utilities/buildShareUrl'
import { publishLinkedIn } from '@/lib/social/publishLinkedIn'
import { collectPostImageUrls } from '@/utilities/collectPostImageUrls'
import type { Post } from '@/payload-types'

type PublishRequest = {
  postId: number
  text: string
  url: string
  title: string
  description?: string
}

type LinkedInSettingsData = {
  linkedin?: {
    accessToken?: string | null
    expiresAt?: string | null
    personUrn?: string | null
  } | null
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
  const { postId, text, url, title, description } = body

  if (!postId || !text || !url || !title) {
    return NextResponse.json({ error: 'postId, text, url, and title are required.' }, { status: 400 })
  }

  const settings = (await payload.findGlobal({
    slug: 'social-settings',
  })) as unknown as LinkedInSettingsData

  if (!settings.linkedin?.accessToken || !settings.linkedin?.personUrn) {
    return NextResponse.json(
      { error: 'LinkedIn is not connected. Use the Connect LinkedIn button first.' },
      { status: 403 },
    )
  }

  // Collect all post images server-side so MediaBlock images at depth 2 are included
  const postDoc = (await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 2,
    overrideAccess: true,
  })) as Post
  const imageUrls = collectPostImageUrls(postDoc)

  let shareUrl: string
  try {
    const result = await publishLinkedIn({
      body: text,
      url,
      title,
      description,
      imageUrls,
      settings: {
        accessToken: settings.linkedin.accessToken,
        personUrn: settings.linkedin.personUrn,
        expiresAt: settings.linkedin.expiresAt,
      },
    })
    shareUrl = result.url
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'LinkedIn publish failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const post = await payload.findByID({ collection: 'posts', id: postId, depth: 0 })
  const existingShares = (post.socialShares ?? []) as ExistingShare[]

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
