import { type NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

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

  const doc = await payload.findByID({
    collection: 'social-posts',
    id: socialPostId,
    depth: 0,
    overrideAccess: true,
  })

  if (!doc) {
    return NextResponse.json({ error: 'Social post not found' }, { status: 404 })
  }

  if (doc.status === 'processing') {
    return NextResponse.json({ error: 'Post is already being published' }, { status: 409 })
  }

  if (doc.status === 'published') {
    return NextResponse.json(
      { success: true, publishedUrl: doc.publishedUrl ?? undefined },
      { status: 200 },
    )
  }

  await payload.update({
    collection: 'social-posts',
    id: socialPostId,
    data: { status: 'pending' },
    overrideAccess: true,
  })

  await payload.jobs.queue({
    task: 'publishSocialPost',
    input: { socialPostId },
  })

  // Threads requires a 35s+ wait inside the publish function — return immediately
  // and let the cron or a later jobs.run() complete it
  if (doc.platform === 'threads') {
    return NextResponse.json({ success: true, message: 'Queued — will publish shortly.' })
  }

  await payload.jobs.run({ overrideAccess: true })

  const updated = await payload.findByID({
    collection: 'social-posts',
    id: socialPostId,
    depth: 0,
    overrideAccess: true,
  })

  if (updated.status === 'published') {
    return NextResponse.json({ success: true, publishedUrl: updated.publishedUrl ?? undefined })
  }

  if (updated.status === 'failed') {
    return NextResponse.json(
      { success: false, error: updated.errorMessage ?? 'Publishing failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, message: 'Job queued — check status shortly.' })
}
