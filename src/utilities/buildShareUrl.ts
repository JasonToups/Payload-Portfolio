export type SocialPlatform = 'twitter' | 'threads' | 'bluesky' | 'linkedin'

export function buildShareUrl(platform: SocialPlatform, postUrl: string, title: string): string {
  const encodedUrl = encodeURIComponent(postUrl)
  const encodedText = encodeURIComponent(`${title}\n\n${postUrl}`)

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`
    case 'threads':
      return `https://www.threads.net/intent/post?text=${encodedText}`
    case 'bluesky':
      return `https://bsky.app/intent/compose?text=${encodedText}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  }
}
