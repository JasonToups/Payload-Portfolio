import { randomBytes } from 'crypto'
import type { CollectionBeforeChangeHook } from 'payload'
import type { Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { fetchOpenGraph, isWeakMetaTitle } from '@/utilities/fetchOpenGraph'
import type { PlatformEntry } from '../types'
import { computePublishStatus, isLinkCardPostType, PLATFORM_LABELS } from '../types'

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

  // Auto-populate url from the linked Post's slug for link-card posts
  if (operation === 'create' && post?.slug && !data.url && isLinkCardPostType(data.postType)) {
    data.url = `${getServerSideURL()}/posts/${post.slug}`
  }

  // Resolve link-card metadata by scraping the target URL — the same procedure
  // for internal Post URLs and external URLs. Runs when not yet populated, or
  // when the stored title is "weak" (a degraded/gated page left " - YouTube"),
  // so existing bad records self-heal. A real (non-weak) title is preserved as a
  // manual override. Fails soft.
  const titleIsWeak = isWeakMetaTitle(data.metaTitle)
  if (
    isLinkCardPostType(data.postType) &&
    typeof data.url === 'string' &&
    data.url.trim() &&
    (titleIsWeak || !data.metaImageUrl)
  ) {
    const meta = await fetchOpenGraph(data.url.trim())
    if (meta.title && titleIsWeak) data.metaTitle = meta.title
    if (meta.description && !data.metaDescription) data.metaDescription = meta.description
    if (meta.imageUrl && !data.metaImageUrl) data.metaImageUrl = meta.imageUrl
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
    const platforms = (data.platforms ?? []) as PlatformEntry[]
    const suffix = platforms.map((e) => PLATFORM_LABELS[e.platform]).join(', ')
    data.title = suffix ? `${post.title} — ${suffix}` : post.title
  }

  // Deduplicate platforms — keep first occurrence of each platform slug
  if (Array.isArray(data.platforms)) {
    const seen = new Set<string>()
    data.platforms = (data.platforms as PlatformEntry[]).filter((entry) => {
      if (!entry.platform || seen.has(entry.platform)) return false
      seen.add(entry.platform)
      return true
    })
  }

  const platforms = (data.platforms ?? []) as PlatformEntry[]

  // When scheduledFor is set, transition all draft platform entries to pending
  if (data.scheduledFor) {
    data.platforms = platforms.map((entry) =>
      entry.status === 'draft' ? { ...entry, status: 'pending' } : entry,
    )
  }

  // When scheduledFor is cleared, reset pending entries back to draft
  // (but only if a schedule was previously set — don't interfere with publish-route-initiated pending)
  const wasScheduled = Boolean(originalDoc?.scheduledFor)
  if (!data.scheduledFor && wasScheduled) {
    data.platforms = platforms.map((entry) =>
      entry.status === 'pending' ? { ...entry, status: 'draft' } : entry,
    )
  }

  // Never-scheduled posts (e.g. immediate publish): stamp the publish date from the
  // earliest platform publish so the list always has a sort key.
  if (!data.scheduledFor) {
    const dates = ((data.platforms ?? []) as PlatformEntry[])
      .map((e) => e.publishedAt)
      .filter((d): d is string => Boolean(d))
      .sort()
    if (dates.length) data.scheduledFor = dates[0]
  }

  // Maintain aggregate status for list display / filter / sort.
  data.publishStatus = computePublishStatus((data.platforms ?? []) as PlatformEntry[])

  return data
}
