export type PlatformSlug = 'linkedin' | 'twitter' | 'bluesky' | 'threads'

export type PlatformPublishStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'published'
  | 'failed'
  | 'cancelled'

export interface PlatformEntry {
  id?: string | null
  platform: PlatformSlug
  status: PlatformPublishStatus
  publishedAt?: string | null
  publishedUrl?: string | null
  errorMessage?: string | null
}

export const PLATFORM_LABELS: Record<PlatformSlug, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
  bluesky: 'BlueSky',
  threads: 'Threads',
}

export const ALL_PLATFORMS: PlatformSlug[] = ['linkedin', 'twitter', 'bluesky', 'threads']

export const PUBLISHABLE_STATUSES: PlatformPublishStatus[] = ['draft', 'failed']

export type PostType = 'url' | 'image' | 'content' | 'linkedPost'

export type PublishStatus = 'draft' | 'scheduled' | 'published' | 'partial' | 'failed'

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  partial: 'Partial',
  failed: 'Failed',
}

/** Collapse per-platform statuses into one overall post status. */
export const computePublishStatus = (platforms: PlatformEntry[]): PublishStatus => {
  if (!platforms.length) return 'draft'
  let published = 0
  let failed = 0
  let inProgress = 0
  for (const p of platforms) {
    if (p.status === 'published') published++
    else if (p.status === 'failed') failed++
    else if (p.status === 'pending' || p.status === 'processing') inProgress++
  }
  if (inProgress > 0) return 'scheduled' // still waiting/working
  if (published > 0 && failed > 0) return 'partial'
  if (published > 0) return 'published'
  if (failed > 0) return 'failed'
  return 'draft' // only draft/cancelled left
}

/** Post types that render a link card (auto URL + scraped meta). */
export const isLinkCardPostType = (postType?: string | null): boolean =>
  (postType ?? 'url') === 'url' || postType === 'linkedPost'
