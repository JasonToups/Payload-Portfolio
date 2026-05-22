import type { Metadata } from 'next/types'

import { PostsGrid } from '@/components/PostsGrid'
import { PostsPageLayout } from '@/components/PostsPageLayout'
import { PostsSearchToggle } from '@/components/PostsSearchToggle'
import { Pagination } from '@/components/Pagination'
import { searchPosts } from '@/utilities/searchPosts'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import type { CardPostData } from '@/components/Card'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ pageNumber: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function Page({ params: paramsPromise, searchParams }: Args) {
  const { pageNumber } = await paramsPromise
  const { q } = await searchParams
  const searchQuery = q?.trim() ?? ''
  const isSearching = searchQuery.length > 0

  const sanitizedPageNumber = Number(pageNumber)
  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const payload = await getPayload({ config: configPromise })

  const [postsResult, searchResults] = await Promise.all([
    isSearching
      ? Promise.resolve(null)
      : payload.find({
          collection: 'posts',
          depth: 1,
          limit: 12,
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
        }),
    isSearching
      ? searchPosts({ query: searchQuery, limit: 12 })
      : Promise.resolve([]),
  ])

  const gridPosts = isSearching
    ? searchResults
    : ((postsResult?.docs ?? []) as CardPostData[])

  const totalPages = postsResult?.totalPages ?? 1
  const currentPage = postsResult?.page ?? sanitizedPageNumber

  return (
    <PostsPageLayout>
      <PageClient />
        {/* Heading + Search */}
        <PostsSearchToggle defaultValue={searchQuery} basePath="/posts" searchQuery={searchQuery} />

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
          <p className="text-muted-foreground">No posts on this page.</p>
        )}

        {/* Pagination */}
        {!isSearching && totalPages > 1 && (
          <Pagination
            basePath="/posts/page"
            page={currentPage}
            totalPages={totalPages}
          />
        )}
    </PostsPageLayout>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Posts — Page ${pageNumber}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 12)
  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
