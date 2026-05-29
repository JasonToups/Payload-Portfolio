import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

type ShortUrlResponse = { shortUrl: string }
type ErrorResponse = { error: string }

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ShortUrlResponse | ErrorResponse>> {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const postId = Number(request.nextUrl.searchParams.get('postId'))
  if (!postId || isNaN(postId)) {
    return NextResponse.json({ error: 'postId query param is required' }, { status: 400 })
  }

  // Return existing short URL for this post if one already exists
  const existing = await payload.find({
    collection: 'short-urls',
    where: { post: { equals: postId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const code = existing.docs[0].code as string
    return NextResponse.json({ shortUrl: `${getServerSideURL()}/s/${code}` })
  }

  // Create a short URL for the post
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 0,
    overrideAccess: true,
  })

  if (!post?.slug) {
    return NextResponse.json({ error: 'Post not found or has no slug' }, { status: 404 })
  }

  const targetUrl = `${getServerSideURL()}/posts/${post.slug}`
  const code = randomBytes(3).toString('hex')

  await payload.create({
    collection: 'short-urls',
    data: { code, targetUrl, post: postId },
    draft: false,
    overrideAccess: true,
  })

  return NextResponse.json({ shortUrl: `${getServerSideURL()}/s/${code}` })
}
