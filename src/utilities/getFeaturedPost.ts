import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'

import type { CardPostData } from '@/components/Card'

type Args = {
  keywordId?: number | string
}

export async function getFeaturedPost({ keywordId }: Args = {}): Promise<CardPostData | null> {
  const payload = await getPayload({ config: configPromise })

  const where: Where = {
    and: [
      { featured: { equals: true } },
      { _status: { equals: 'published' } },
    ],
  }

  if (keywordId !== undefined) {
    where.and = [
      ...where.and!,
      { keywords: { in: [keywordId] } },
    ]
  }

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    sort: '-createdAt',
    overrideAccess: false,
    where,
    select: {
      title: true,
      slug: true,
      categories: true,
      keywords: true,
      meta: true,
      publishedAt: true,
      content: true,
    },
  })

  return (docs[0] as CardPostData) ?? null
}
