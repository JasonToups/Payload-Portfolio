import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { SocialShareBar } from '@/components/SocialShareBar'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getRelatedPostsByKeywords } from '@/utilities/getRelatedPostsByKeywords'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  return []
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const manualRelatedPosts = (post.relatedPosts ?? []).filter(
    (r): r is Post => typeof r === 'object',
  )

  const keywordIds = (post.keywords ?? []).map((k) => (typeof k === 'object' ? k.id : k))
  const categoryIds = (post.categories ?? []).map((k) => (typeof k === 'object' ? k.id : k))

  const relatedPosts =
    manualRelatedPosts.length > 0
      ? manualRelatedPosts
      : post.includeRelatedPosts !== false
        ? await getRelatedPostsByKeywords({ keywordIds, categoryIds, currentPostId: post.id })
        : []

  return (
    <article className="pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
          {/* Share: LEFT on desktop, BELOW post body on mobile (right-aligned) */}
          <aside
            aria-label="Share this post"
            className="order-2 lg:order-none mt-16 lg:mt-0 flex items-end lg:items-start lg:sticky lg:top-8 lg:self-start lg:shrink-0 lg:w-60 lg:px-[22px] lg:py-2"
          >
            <SocialShareBar slug={decodedSlug} title={post.title ?? ''} />
          </aside>

          {/* Post Body + Related Posts: RIGHT on desktop, ABOVE on mobile */}
          <div className="order-1 lg:order-none max-w-[55rem] min-w-0">
            <RichText data={post.content} enableGutter={false} />
            {relatedPosts.length > 0 && (
              <section
                className="mt-16 pt-8"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p
                  className="font-mono mb-6"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  RELATED POSTS
                </p>
                <RelatedPosts docs={relatedPosts} />
              </section>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, url: `/posts/${decodedSlug}` })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
