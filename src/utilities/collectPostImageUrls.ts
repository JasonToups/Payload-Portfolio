import type { Media, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type LexicalNode = {
  type: string
  version: number
  fields?: Record<string, unknown>
  children?: LexicalNode[]
}

type MediaBlockFields = {
  blockType: string
  media: number | Media
}

function absoluteUrl(url: string): string {
  return url.startsWith('http') ? url : `${getServerSideURL()}${url}`
}

function extractMediaBlockUrls(nodes: LexicalNode[]): string[] {
  const urls: string[] = []
  for (const node of nodes) {
    if (node.type === 'block' && node.fields) {
      const fields = node.fields as MediaBlockFields
      if (fields.blockType === 'mediaBlock' && typeof fields.media === 'object' && fields.media !== null) {
        const url = (fields.media as Media).url
        if (url) urls.push(absoluteUrl(url))
      }
    }
    if (node.children?.length) {
      urls.push(...extractMediaBlockUrls(node.children))
    }
  }
  return urls
}

export function collectPostImageUrls(post: Post): string[] {
  const urls: string[] = []

  if (post.heroImage && typeof post.heroImage === 'object') {
    const heroUrl = (post.heroImage as Media).url
    if (heroUrl) urls.push(absoluteUrl(heroUrl))
  }

  const children = post.content?.root?.children as LexicalNode[] | undefined
  if (children?.length) {
    urls.push(...extractMediaBlockUrls(children))
  }

  // de-duplicate and cap at 20 (Threads carousel limit)
  return [...new Set(urls)].slice(0, 20)
}
