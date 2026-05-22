import type { Metadata } from 'next/types'

import { PostsPageLayout } from '@/components/PostsPageLayout'
import { PostsBrowseSection } from '@/components/PostsBrowseSection'
import { searchPosts } from '@/utilities/searchPosts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'
import type { CardPostData } from '@/components/Card'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{
    name: string
    pageNumber: string
  }>
  searchParams: Promise<{ q?: string }>
}

export default async function Page({ params: paramsPromise, searchParams }: Args) {
  const { name, pageNumber } = await paramsPromise
  const { q } = await searchParams
  const searchQuery = q?.trim() ?? ''
  const isSearching = searchQuery.length > 0
  const sanitizedPageNumber = Number(pageNumber)
  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const keywordName = name.replace(/-/g, ' ')
  const payload = await getPayload({ config: configPromise })

  const keywordResult = await payload.find({
    collection: 'keywords',
    limit: 1,
    where: { name: { equals: keywordName } },
  })

  const keyword = keywordResult.docs?.[0]
  if (!keyword) notFound()

  const limit = 12
  const [postsResult, searchResults] = await Promise.all([
    isSearching
      ? Promise.resolve(null)
      : payload.find({
          collection: 'posts',
          depth: 1,
          limit,
          page: sanitizedPageNumber,
          overrideAccess: false,
          sort: '-publishedAt',
          select: {
            id: true,
            title: true,
            slug: true,
            categories: true,
            keywords: true,
            meta: true,
            publishedAt: true,
            content: true,
          },
          where: {
            and: [{ keywords: { in: [keyword.id] } }, { _status: { equals: 'published' } }],
          },
        }),
    isSearching ? searchPosts({ query: searchQuery, limit }) : Promise.resolve([]),
  ])

  const gridPosts = isSearching ? searchResults : ((postsResult?.docs ?? []) as CardPostData[])

  const totalPages = postsResult?.totalPages ?? 1
  const currentPage = postsResult?.page ?? sanitizedPageNumber

  return (
    <PostsPageLayout>
      <PostsBrowseSection
        backLink
        heading={`Posts tagged: ${keyword.name}`}
        basePath={`/keywords/${name}`}
        searchQuery={searchQuery}
        posts={gridPosts}
        currentPage={currentPage}
        totalPages={totalPages}
        paginationBasePath={`/keywords/${name}/page`}
        emptyMessage="No posts on this page."
      />
    </PostsPageLayout>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { name, pageNumber } = await paramsPromise
  const keywordName = name.replace(/-/g, ' ')
  return {
    title: `Posts tagged: ${keywordName} — Page ${pageNumber}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const keywords = await payload.find({
    collection: 'keywords',
    limit: 1000,
    pagination: false,
  })

  const params: { name: string; pageNumber: string }[] = []

  for (const kw of keywords.docs) {
    const { totalDocs } = await payload.count({
      collection: 'posts',
      overrideAccess: false,
      where: { keywords: { in: [kw.id] } },
    })

    const totalPages = Math.ceil(totalDocs / 12)
    const urlName = kw.name.replace(/\s+/g, '-')

    for (let i = 1; i <= totalPages; i++) {
      params.push({ name: urlName, pageNumber: String(i) })
    }
  }

  return params
}
