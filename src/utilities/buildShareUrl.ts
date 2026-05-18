export type SocialPlatform = 'twitter' | 'threads' | 'bluesky' | 'linkedin'

export type SocialProfile = {
  platform: SocialPlatform
  url: string
  id?: string | null
}

export type ShareOptions = {
  profileUrl?: string
  text?: string
  hashtags?: string[]
}

function extractHandleFromUrl(platform: SocialPlatform, profileUrl: string): string {
  try {
    const url = new URL(profileUrl)
    const segments = url.pathname.split('/').filter(Boolean)
    switch (platform) {
      case 'twitter':
        // https://twitter.com/username or https://x.com/username
        return segments[0] ?? ''
      case 'threads':
        // https://www.threads.net/@username
        return (segments[0] ?? '').replace(/^@/, '')
      case 'bluesky':
        // https://bsky.app/profile/handle.bsky.social — segments[0] = 'profile'
        return segments[1] ?? ''
      case 'linkedin':
        return ''
    }
  } catch {
    return ''
  }
}

export function buildShareUrl(
  platform: SocialPlatform,
  postUrl: string,
  options: ShareOptions = {},
): string {
  const { profileUrl, text, hashtags } = options
  const handle = profileUrl ? extractHandleFromUrl(platform, profileUrl) : ''

  switch (platform) {
    case 'twitter': {
      const params = new URLSearchParams({ url: postUrl })
      if (text) params.set('text', text)
      if (hashtags?.length)
        params.set('hashtags', hashtags.map((h) => h.replace(/ /g, '_')).join(','))
      if (handle) params.set('via', handle)
      return `https://twitter.com/intent/tweet?${params.toString()}`
    }
    case 'threads': {
      const parts: string[] = [postUrl]
      if (text) parts.unshift(text)
      if (handle) parts.push(`via @${handle}`)
      return `https://www.threads.net/intent/post?text=${encodeURIComponent(parts.join('\n\n'))}`
    }
    case 'bluesky': {
      const parts: string[] = [postUrl]
      if (text) parts.unshift(text)
      if (handle) parts.push(`via @${handle}`)
      return `https://bsky.app/intent/compose?text=${encodeURIComponent(parts.join('\n\n'))}`
    }
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
  }
}
