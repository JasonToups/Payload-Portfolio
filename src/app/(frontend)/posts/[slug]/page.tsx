import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { SocialShareBar } from '@/components/SocialShareBar'
import { SubscribePostBlock } from '@/components/SubscribePostBlock'
import { getCachedGlobal } from '@/utilities/getGlobals'

import type { Post, SubscribePostBlock as SubscribePostBlockType } from '@/payload-types'

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

  const subscribePostBlock = (await getCachedGlobal(
    'subscribe-post-block',
  )()) as SubscribePostBlockType

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
    <article>
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="pt-0 pb-0">
        <div className="flex bg-white dark:bg-black flex-row">
          {/* Sidebar: hidden on mobile, flex-grow-1 sticky panel on desktop */}
          <aside
            aria-label="Post sidebar"
            className="hidden w-full lg:flex lg:flex-col lg:justify-between lg:flex-1 lg:sticky lg:top-0 lg:h-screen py-8 px-6 bg-background"
          >
            <SocialShareBar slug={decodedSlug} title={post.title ?? ''} />
            <div className="flex flex-column justify-end">
              <SubscribePostBlock
                description={subscribePostBlock.description}
                placeholder={subscribePostBlock.placeholder}
                buttonText={subscribePostBlock.buttonText}
                meta={subscribePostBlock.meta}
                source={subscribePostBlock.source}
              />
            </div>
          </aside>

          {/* Post Body: full-width on mobile, flex-grow-2 on desktop */}

          <div className="lg:flex:2 w-full py-8 px-10 bg-white dark:bg-black">
            <div className="flex justify-center">
              <div className="max-w-3xl">
                <RichText data={post.content} enableGutter={false} />
              </div>
            </div>
            {/* Mobile-only: Share + Subscribe between content and related posts */}
            <div className="lg:hidden mt-8 pt-8">
              <SocialShareBar slug={decodedSlug} title={post.title ?? ''} />
            </div>
            <div className="lg:hidden flex justify-end">
              <SubscribePostBlock
                description={subscribePostBlock.description}
                placeholder={subscribePostBlock.placeholder}
                buttonText={subscribePostBlock.buttonText}
                meta={subscribePostBlock.meta}
                source={subscribePostBlock.source}
              />
            </div>

            {relatedPosts.length > 0 && (
              <section className="mt-16 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
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
