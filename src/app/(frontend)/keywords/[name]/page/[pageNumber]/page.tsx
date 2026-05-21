import type { Metadata } from 'next/types'

import { BackLink } from '@/components/ui/back-link'
import { PostsPageLayout } from '@/components/PostsPageLayout'
import { PostsGrid } from '@/components/PostsGrid'
import { PostsSearchForm } from '@/components/PostsSearch'
import { Pagination } from '@/components/Pagination'
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
}

export default async function Page({ params: paramsPromise }: Args) {
  const { name, pageNumber } = await paramsPromise
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

  const posts = await payload.find({
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
    where: {
      and: [
        { keywords: { in: [keyword.id] } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  const basePath = `/keywords/${name}/page`

  return (
    <PostsPageLayout>
        {/* Back nav + Heading */}
        <div className="flex flex-col gap-2">
          <BackLink />
          <h1 className="font-display text-3xl font-semibold text-foreground capitalize">
            {keyword.name}
          </h1>
        </div>

        {/* Heading + Search */}
        <div className="flex flex-row items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Posts tagged: {keyword.name}
          </h2>
          <PostsSearchForm basePath={`/keywords/${name}`} />
        </div>

        {/* Grid */}
        {posts.docs.length > 0 ? (
          <PostsGrid posts={posts.docs as CardPostData[]} />
        ) : (
          <p className="text-muted-foreground">No posts on this page.</p>
        )}

        {/* Pagination */}
        {posts.totalPages > 1 && posts.page && (
          <Pagination basePath={basePath} page={posts.page} totalPages={posts.totalPages} />
        )}
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
