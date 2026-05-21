import type { Metadata } from 'next/types'

import { BackLink } from '@/components/ui/back-link'
import { PostsPageLayout } from '@/components/PostsPageLayout'
import { PostCardFeatured } from '@/components/PostCardFeatured'
import { PostsGrid } from '@/components/PostsGrid'
import { PostsSearchForm } from '@/components/PostsSearch'
import { Pagination } from '@/components/Pagination'
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

  const basePath = `/keywords/${name}/page`

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
      {/* Back nav + Heading */}
      <div className="flex flex-col gap-2">
        <BackLink />
        <h1 className="font-display text-3xl font-semibold text-foreground capitalize">
          {keyword.name}
        </h1>
      </div>

      {/* Featured Post (if keyword has a featured post) */}
      {featuredPost && (
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[12px] uppercase tracking-[1px] text-muted-foreground">
            Featured Post
          </span>
          <PostCardFeatured doc={featuredPost} />
        </div>
      )}

      {/* Heading + Search */}
      <div className="flex flex-col gap-4 md:flex-row w-full items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Posts tagged: {keyword.name}
        </h2>
        <PostsSearchForm defaultValue={searchQuery} basePath={`/keywords/${name}`} />
      </div>

      {/* Grid or Search Results */}
      {isSearching ? (
        <div className="flex flex-col gap-8">
          <p className="font-mono text-sm text-muted-foreground">
            Searching for <span className="text-foreground">&ldquo;{searchQuery}&rdquo;</span>
            {searchResults.length > 0
              ? ` — ${searchResults.length} result${searchResults.length === 1 ? '' : 's'}`
              : ''}
          </p>
          {searchResults.length > 0 ? (
            <PostsGrid posts={searchResults} />
          ) : (
            <p className="text-muted-foreground">No posts found for &ldquo;{searchQuery}&rdquo;.</p>
          )}
        </div>
      ) : gridPosts.length > 0 ? (
        <PostsGrid posts={gridPosts} />
      ) : (
        <p className="text-muted-foreground">No posts tagged with &ldquo;{keyword.name}&rdquo;.</p>
      )}

      {/* Pagination */}
      {!isSearching && totalPages > 1 && (
        <Pagination basePath={basePath} page={currentPage} totalPages={totalPages} />
      )}
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
