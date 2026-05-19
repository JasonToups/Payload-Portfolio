import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const rawUrl = image.sizes?.og?.url ?? image.url
    if (rawUrl) {
      url = rawUrl.startsWith('http') ? rawUrl : serverUrl + rawUrl
    }
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  url?: string
}): Promise<Metadata> => {
  const { doc, url } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title || 'Payload Website Template'
  const description = doc?.meta?.description || ''

  return {
    description,
    openGraph: await mergeOpenGraph({
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: url ?? (Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/'),
    }),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    title,
  }
}
