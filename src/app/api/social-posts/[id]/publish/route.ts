import { type NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { SocialPost } from '@/payload-types'
import type { PlatformEntry } from '@/collections/SocialPosts/types'
import { PUBLISHABLE_STATUSES } from '@/collections/SocialPosts/types'

export const maxDuration = 60

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { id } = await params
  const socialPostId = Number(id)

  if (!socialPostId || Number.isNaN(socialPostId)) {
    return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const doc = (await payload.findByID({
    collection: 'social-posts',
    id: socialPostId,
    depth: 0,
    overrideAccess: true,
  })) as SocialPost

  if (!doc) {
    return NextResponse.json({ error: 'Social post not found' }, { status: 404 })
  }

  const platformEntries = (doc.platforms ?? []) as PlatformEntry[]
  const publishable = platformEntries.filter((e) => PUBLISHABLE_STATUSES.includes(e.status))

  if (publishable.length === 0) {
    const allProcessing = platformEntries.every((e) => e.status === 'processing')
    if (allProcessing) {
      return NextResponse.json({ error: 'Post is already being published' }, { status: 409 })
    }
    const allPublished = platformEntries.every((e) => e.status === 'published')
    if (allPublished) {
      return NextResponse.json({ success: true, message: 'All platforms already published' }, { status: 200 })
    }
    return NextResponse.json({ error: 'No publishable platforms' }, { status: 409 })
  }

  // Set all publishable entries to pending
  const updatedPlatforms = platformEntries.map((entry) =>
    PUBLISHABLE_STATUSES.includes(entry.status) ? { ...entry, status: 'pending' as const } : entry,
  )

  await payload.update({
    collection: 'social-posts',
    id: socialPostId,
    data: { platforms: updatedPlatforms },
    overrideAccess: true,
  })

  // Queue one job per publishable platform
  for (const entry of publishable) {
    await payload.jobs.queue({
      task: 'publishSocialPost',
      input: { socialPostId, platform: entry.platform },
    })
  }

  await payload.jobs.run({ overrideAccess: true })

  const updated = (await payload.findByID({
    collection: 'social-posts',
    id: socialPostId,
    depth: 0,
    overrideAccess: true,
  })) as SocialPost

  const resultEntries = (updated.platforms ?? []) as PlatformEntry[]
  const published = resultEntries.filter((e) => e.status === 'published').map((e) => e.platform)
  const failed = resultEntries.filter((e) => e.status === 'failed').map((e) => e.platform)
  const queued = resultEntries.filter((e) => e.status === 'pending' || e.status === 'processing').map((e) => e.platform)

  if (failed.length > 0 && published.length === 0) {
    const firstFailed = resultEntries.find((e) => e.status === 'failed')
    return NextResponse.json(
      { success: false, error: firstFailed?.errorMessage ?? 'Publishing failed', published, failed, queued },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, published, failed, queued })
}
