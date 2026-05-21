import type { Metadata } from 'next/types'

import { PostCardFeatured } from '@/components/PostCardFeatured'
import { PostCardMinimal } from '@/components/PostCardMinimal'
import { PostsGrid } from '@/components/PostsGrid'
import { PostsSearchForm } from '@/components/PostsSearch'
import { Pagination } from '@/components/Pagination'
import { getFeaturedPost } from '@/utilities/getFeaturedPost'
import { searchPosts } from '@/utilities/searchPosts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import type { CardPostData } from '@/components/Card'
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
              and: [
                { _status: { equals: 'published' } },
                { id: { not_in: [featuredPost.id] } },
              ],
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
    <div className="flex flex-col gap-[62px] pt-16 pb-16">
      <PageClient />

      <div className="container flex flex-col gap-[60px]">
        {/* Section 1: Featured Post + Related Posts sidebar (Page 1 only, when featured exists) */}
        {featuredPost && (
          <div className="flex flex-row gap-[100px] items-start">
            {/* Featured Post */}
            <div className="flex flex-col gap-[50px] flex-1">
              <h2 className="font-display text-[41px] font-normal text-[#1e1a17]">
                Featured Post
              </h2>
              <PostCardFeatured doc={featuredPost} />
            </div>

            {/* Related Posts sidebar */}
            <div className="flex flex-col gap-[50px] w-[397px] shrink-0">
              <h2 className="font-display text-[41px] font-normal text-[#1e1a17]">
                Related Posts
              </h2>
              <div className="flex flex-col gap-[21px]">
                {relatedPosts.map((post, i) => (
                  <React.Fragment key={post.slug}>
                    <PostCardMinimal doc={post} />
                    {i < relatedPosts.length - 1 && (
                      <div className="w-full border-t-2 border-[#efeae5]" role="separator" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Heading + Search */}
        <div className="flex flex-row items-center justify-between">
          <h2 className="font-display text-[41px] font-normal text-[#1e1a17]">All Posts</h2>
          <PostsSearchForm defaultValue={searchQuery} basePath="/posts" />
        </div>

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
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Posts',
  }
}
