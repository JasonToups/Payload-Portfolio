import type { Metadata } from 'next/types'

import { BackLink } from '@/components/ui/back-link'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{
    name: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { name } = await paramsPromise
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
    page: 1,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      and: [
        { keywords: { in: [keyword.id] } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  const basePath = `/keywords/${name}/page`

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{keyword.name}</h1>
        </div>
        <BackLink />
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && (
          <Pagination basePath={basePath} page={posts.page ?? 1} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
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
