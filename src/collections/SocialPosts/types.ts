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

/** Post types that render a link card (auto URL + scraped meta). */
export const isLinkCardPostType = (postType?: string | null): boolean =>
  (postType ?? 'url') === 'url' || postType === 'linkedPost'
