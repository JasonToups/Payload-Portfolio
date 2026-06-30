export type SocialPlatform = 'twitter' | 'threads' | 'bluesky' | 'linkedin' | 'facebook'

export type SocialProfile = {
  platform: SocialPlatform
  url: string
  id?: string | null
}

export type ShareOptions = {
  profileUrl?: string
  text?: string
  hashtags?: string[]
  tag?: string
  title?: string
  summary?: string
  source?: string
  replyControl?: 'everyone' | 'accounts_you_follow' | 'mentioned_only' | 'followers_only'
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
      case 'facebook':
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
  const { profileUrl, text, hashtags, tag, title, summary, source, replyControl } = options
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
      const rawTag = tag ?? hashtags?.[0]
      const sanitizedTag = rawTag?.replace(/[.\n\t&]/g, '').trim().slice(0, 50)

      const parts: string[] = []
      if (text) parts.push(text)
      parts.push(postUrl)
      if (handle) parts.push(`via @${handle}`)

      const params = new URLSearchParams({ url: postUrl })
      if (parts.length) params.set('text', parts.join('\n\n'))
      if (sanitizedTag) params.set('tag', sanitizedTag)
      params.set('reply_control', replyControl ?? 'everyone')
      return `https://www.threads.com/intent/post?${params.toString()}`
    }
    case 'bluesky': {
      const hashtagString = hashtags?.length ? hashtags.map((h) => `#${h.replace(/ /g, '_')}`).join(' ') : ''
      const parts = [text, `${postUrl} `, handle ? `via @${handle}` : '', hashtagString].filter(
        Boolean,
      )
      return `https://bsky.app/intent/compose?text=${encodeURIComponent(parts.join('\n\n'))}`
    }
    case 'linkedin': {
      const params = new URLSearchParams({ url: postUrl })
      if (title) params.set('title', title)
      if (summary) params.set('summary', summary)
      if (source) params.set('source', source)
      return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
    }
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
  }
}
