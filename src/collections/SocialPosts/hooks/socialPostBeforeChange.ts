import { randomBytes } from 'crypto'
import type { CollectionBeforeChangeHook } from 'payload'
import type { Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
  bluesky: 'BlueSky',
  threads: 'Threads',
}

export const socialPostBeforeChange: CollectionBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  const postId =
    data.linkedPost && typeof data.linkedPost === 'object'
      ? (data.linkedPost as { id: number }).id
      : (data.linkedPost as number | null | undefined)

  let post: Post | null = null
  if (postId) {
    post = (await req.payload.findByID({
      collection: 'posts',
      id: postId,
      depth: 0,
      overrideAccess: true,
    })) as Post
  }

  // Inherit keywords from the linked Post when creating a new SocialPost
  if (operation === 'create' && post && !data.keywords?.length) {
    const postKeywords = (post.keywords ?? []) as (number | { id: number })[]
    if (postKeywords.length > 0) {
      data.keywords = postKeywords.map((k) => (typeof k === 'object' ? k.id : k))
    }
  }

  // Auto-populate body from the linked Post's socialPostBody
  if (operation === 'create' && post?.socialPostBody && !data.body) {
    data.body = post.socialPostBody
  }

  // Auto-populate url from the linked Post's slug for URL-type posts
  if (operation === 'create' && post?.slug && !data.url && (data.postType ?? 'url') === 'url') {
    data.url = `${getServerSideURL()}/posts/${post.slug}`
  }

  if (postId && post?.slug && !data.shortUrl) {
    const code = randomBytes(3).toString('hex')
    const targetUrl = `${getServerSideURL()}/posts/${post.slug}`
    await req.payload.create({
      collection: 'short-urls',
      data: { code, targetUrl, post: post.id },
      overrideAccess: true,
    })
    data.shortUrl = `${getServerSideURL()}/s/${code}`
  }

  if (!data.title && post) {
    const label = PLATFORM_LABELS[data.platform as string] ?? String(data.platform)
    data.title = `${label} — ${post.title}`
  }

  if (data.scheduledFor && data.status === 'draft') {
    data.status = 'pending'
  }

  // Only reset to draft when a previously-set schedule is being cleared.
  // The publish route sets status='pending' on posts that never had a scheduledFor date —
  // wasScheduled stays false for those, so the reset is skipped.
  const wasScheduled = Boolean(originalDoc?.scheduledFor)
  if (!data.scheduledFor && data.status === 'pending' && wasScheduled) {
    data.status = 'draft'
  }

  return data
}
