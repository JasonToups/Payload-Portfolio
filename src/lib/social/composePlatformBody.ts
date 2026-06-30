import type { PlatformSlug } from '@/collections/SocialPosts/types'

export type KeywordLike = { name: string }

/**
 * Build the literal text sent to a platform from the base body + keywords, mirroring each
 * platform's hashtag rules. This is the single source of truth shared by the per-platform
 * body editor, the publish job, and the backfill migration.
 *
 * - LinkedIn: base (trimmed) + space-joined `#Under_Scored` hashtags
 * - BlueSky / Facebook: base + `\n\n` + space-joined `#NoSpace` hashtags
 * - Twitter / Threads: clean base text (hashtags/topic handled structurally)
 */
export function composePlatformBody(
  platform: PlatformSlug,
  base: string,
  keywords: KeywordLike[],
): string {
  const body = base ?? ''
  if (platform === 'linkedin') {
    const tags = keywords.map((k) => `#${k.name.replace(/ /g, '_')}`).join(' ')
    return tags ? `${body.trim()} ${tags}` : body
  }
  if (platform === 'bluesky' || platform === 'facebook') {
    const tags = keywords.map((k) => `#${k.name.replace(/\s+/g, '')}`).join(' ')
    return tags ? `${body}\n\n${tags}` : body
  }
  return body // twitter, threads: clean text
}

/**
 * Threads honors a single topic tag, derived from the first keyword (alphanumeric only).
 * This stays structural — it is sent as the `topic_tag` API param, never inlined in the body.
 */
export function composeThreadsTopic(keywords: KeywordLike[]): string | undefined {
  const sanitized = keywords[0]?.name.replace(/[^a-zA-Z0-9]/g, '')
  return sanitized || undefined
}
