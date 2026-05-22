import type { Metadata } from 'next/types'

import { PostsPageLayout } from '@/components/PostsPageLayout'
import { PostsBrowseSection } from '@/components/PostsBrowseSection'
import { getFeaturedPost } from '@/utilities/getFeaturedPost'
import { searchPosts } from '@/utilities/searchPosts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'
import type { CardPostData } from '@/components/Card'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ name: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function Page({ params: paramsPromise, searchParams }: Args) {
  const { name } = await paramsPromise
  const { q } = await searchParams
  const searchQuery = q?.trim() ?? ''
  const isSearching = searchQuery.length > 0

  const keywordName = name.replace(/-/g, ' ')
  const payload = await getPayload({ config: configPromise })

  const keywordResult = await payload.find({
    collection: 'keywords',
    limit: 1,
    where: { name: { equals: keywordName } },
  })

  const keyword = keywordResult.docs?.[0]
  if (!keyword) notFound()

  const featuredPost = await getFeaturedPost({ keywordId: keyword.id })
  const limit = featuredPost ? 6 : 12

  const [postsResult, searchResults] = await Promise.all([
    isSearching
      ? Promise.resolve(null)
      : payload.find({
          collection: 'posts',
          depth: 1,
          limit,
          page: 1,
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
            and: [
              { keywords: { in: [keyword.id] } },
              { _status: { equals: 'published' } },
              ...(featuredPost ? [{ id: { not_in: [featuredPost.id] } }] : []),
            ],
          },
        }),
    isSearching
      ? searchPosts({ query: searchQuery, limit, excludeId: featuredPost?.id })
      : Promise.resolve([]),
  ])

  const gridPosts = isSearching ? searchResults : ((postsResult?.docs ?? []) as CardPostData[])

  const totalPages = postsResult?.totalPages ?? 1
  const currentPage = postsResult?.page ?? 1

  return (
    <PostsPageLayout>
      <PostsBrowseSection
        backLink
        featuredPost={featuredPost}
        heading={`Posts tagged: ${keyword.name}`}
        basePath={`/keywords/${name}`}
        searchQuery={searchQuery}
        posts={gridPosts}
        currentPage={currentPage}
        totalPages={totalPages}
        paginationBasePath={`/keywords/${name}/page`}
        emptyMessage={`No posts tagged with “${keyword.name}”.`}
      />
    </PostsPageLayout>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { name } = await paramsPromise
  const keywordName = name.replace(/-/g, ' ')
  return {
    title: `Posts tagged: ${keywordName}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const keywords = await payload.find({
    collection: 'keywords',
    limit: 1000,
    pagination: false,
  })

  return keywords.docs.map((kw) => ({
    name: kw.name.replace(/\s+/g, '-'),
  }))
}
