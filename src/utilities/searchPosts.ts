import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { CardPostData } from '@/components/Card'
import { getPostsByFilters } from './getPostsByFilters'

type Args = {
  query: string
  limit: number
  excludeId?: number | string
}

export async function searchPosts({ query, limit, excludeId }: Args): Promise<CardPostData[]> {
  if (!query.trim()) return []

  const payload = await getPayload({ config: configPromise })

  const selectFields = {
    title: true as const,
    slug: true as const,
    categories: true as const,
    keywords: true as const,
    meta: true as const,
    publishedAt: true as const,
    content: true as const,
  }

  const baseWhere = excludeId !== undefined ? { id: { not_in: [excludeId] } } : undefined

  const [titleMatches, descriptionMatches, keywordResult] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 20,
      sort: '-createdAt',
      overrideAccess: false,
      select: selectFields,
      where: {
        and: [
          { title: { like: query } },
          { _status: { equals: 'published' } },
          ...(baseWhere ? [baseWhere] : []),
        ],
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 20,
      sort: '-createdAt',
      overrideAccess: false,
      select: selectFields,
      where: {
        and: [
          { postDescription: { like: query } },
          { _status: { equals: 'published' } },
          ...(baseWhere ? [baseWhere] : []),
        ],
      },
    }),
    payload.find({
      collection: 'keywords',
      limit: 10,
      where: { name: { like: query } },
    }),
  ])

  const seenIds = new Set<number | string>()
  const results: CardPostData[] = []

  const addUnique = (docs: CardPostData[]) => {
    for (const doc of docs) {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id)
        results.push(doc)
        if (results.length >= limit) return true
      }
    }
    return false
  }

  if (addUnique(titleMatches.docs as CardPostData[])) return results
  if (addUnique(descriptionMatches.docs as CardPostData[])) return results

  if (keywordResult.docs.length > 0) {
    const keywordIds = keywordResult.docs.map((kw) => kw.id)
    const keywordPosts = await getPostsByFilters({
      keywordIds,
      limit: 20,
    })
    const filtered = excludeId
      ? (keywordPosts as CardPostData[]).filter((p) => p.id !== excludeId)
      : (keywordPosts as CardPostData[])
    addUnique(filtered)
  }

  return results
}
