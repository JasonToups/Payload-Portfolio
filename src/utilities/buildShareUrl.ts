export type SocialPlatform = 'twitter' | 'threads' | 'bluesky' | 'linkedin'

export type SocialProfile = {
  platform: SocialPlatform
  url: string
  id?: string | null
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
  title: string,
  profileUrl?: string,
): string {
  const encodedUrl = encodeURIComponent(postUrl)
  const handle = profileUrl ? extractHandleFromUrl(platform, profileUrl) : ''

  switch (platform) {
    case 'twitter': {
      const base = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`
      return handle ? `${base}&via=${handle}` : base
    }
    case 'threads': {
      const text = handle ? `${title}\n\n${postUrl}\n\nvia @${handle}` : `${title}\n\n${postUrl}`
      return `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`
    }
    case 'bluesky': {
      const text = handle ? `${title}\n\n${postUrl}\n\nvia @${handle}` : `${title}\n\n${postUrl}`
      return `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`
    }
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  }
}
