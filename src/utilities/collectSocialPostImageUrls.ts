import type { Media } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type SocialPostImages = {
  heroImage?: (number | null) | Media
  images?: (number | Media)[] | null
}

export function collectSocialPostImageUrls(doc: SocialPostImages): string[] {
  const base = getServerSideURL()
  const urls: string[] = []

  if (doc.heroImage && typeof doc.heroImage === 'object') {
    const url = (doc.heroImage as Media).url
    if (url) urls.push(url.startsWith('http') ? url : `${base}${url}`)
  }

  for (const img of doc.images ?? []) {
    if (typeof img === 'object' && img !== null) {
      const url = (img as Media).url
      if (url) urls.push(url.startsWith('http') ? url : `${base}${url}`)
    }
  }

  return [...new Set(urls)].slice(0, 20)
}
