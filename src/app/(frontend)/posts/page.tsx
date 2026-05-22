import type { Metadata } from 'next/types'

import { PostCardFeatured } from '@/components/PostCardFeatured'
import { PostsPageLayout } from '@/components/PostsPageLayout'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PostsGrid } from '@/components/PostsGrid'
import { Pagination } from '@/components/Pagination'
import { getFeaturedPost } from '@/utilities/getFeaturedPost'
import { searchPosts } from '@/utilities/searchPosts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import PageClient from './page.client'
import type { CardPostData } from '@/components/Card'
import { PostsSearchToggle } from '@/components/PostsSearchToggle'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{ q?: string }>
}

export default async function Page({ searchParams }: Args) {
  const { q } = await searchParams
  const searchQuery = q?.trim() ?? ''
  const isSearching = searchQuery.length > 0

  const featuredPost = await getFeaturedPost()
  const limit = featuredPost ? 6 : 12

  const payload = await getPayload({ config: configPromise })

  const regularPostsWhere: Where = {
    and: [
      { _status: { equals: 'published' } },
      ...(featuredPost ? [{ id: { not_in: [featuredPost.id] } }] : []),
    ],
  }

  const [regularPostsResult, relatedPosts, searchResults] = await Promise.all([
    isSearching
      ? Promise.resolve(null)
      : payload.find({
          collection: 'posts',
          depth: 1,
          limit,
          overrideAccess: false,
          sort: '-publishedAt',
          where: regularPostsWhere,
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
        }),
    featuredPost
      ? payload
          .find({
            collection: 'posts',
            depth: 1,
            limit: 3,
            overrideAccess: false,
            sort: '-publishedAt',
            where: {
              and: [{ _status: { equals: 'published' } }, { id: { not_in: [featuredPost.id] } }],
            },
            select: {
              id: true,
              title: true,
              slug: true,
              keywords: true,
              meta: true,
            },
          })
          .then((r) => r.docs as CardPostData[])
      : Promise.resolve([]),
    isSearching
      ? searchPosts({ query: searchQuery, limit, excludeId: featuredPost?.id })
      : Promise.resolve([]),
  ])

  const gridPosts = isSearching
    ? searchResults
    : ((regularPostsResult?.docs ?? []) as CardPostData[])

  const totalPages = regularPostsResult?.totalPages ?? 1
  const currentPage = regularPostsResult?.page ?? 1

  return (
    <PostsPageLayout>
      <PageClient />
      {/* Section 1: Featured Post + Related Posts sidebar (Page 1 only, when featured exists) */}
      {featuredPost && (
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-15 items-center mb-16">
          {/* Featured Post */}
          <div className="flex flex-col gap-8 md:gap-9 flex-1">
            <PostCardFeatured doc={featuredPost} />
          </div>

          {/* Related Posts sidebar */}
          <div className="flex flex-col gap-9 md:gap-12 w-full lg:w-99.25 shrink-0">
            <RelatedPosts docs={relatedPosts} layout="sidebar" />
          </div>
        </div>
      )}

      {/* Section 2: Heading + Search */}
      <PostsSearchToggle defaultValue={searchQuery} basePath="/posts" searchQuery={searchQuery} />

      {/* Section 3: Grid or Search Results */}
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
        <p className="text-muted-foreground">No posts yet.</p>
      )}

      {/* Section 4: Pagination (only when not searching) */}
      {!isSearching && totalPages > 1 && currentPage && (
        <Pagination page={currentPage} totalPages={totalPages} />
      )}
    </PostsPageLayout>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Posts',
  }
}
