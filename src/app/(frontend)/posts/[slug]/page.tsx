import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { SubscribePostBlock } from '@/components/SubscribePostBlock'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSocialSettings } from '@/utilities/getSocialSettings'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import { SocialShareBar } from '@/components/SocialShareBar'

import type { Keyword, Post, SubscribePostBlock as SubscribePostBlockType } from '@/payload-types'

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

  const socialSettings = await getSocialSettings()
  const socialProfiles = socialSettings?.profiles ?? []
  const keywordNames = (post.keywords ?? [])
    .filter((k): k is Keyword => typeof k === 'object')
    .map((k) => k.name)

  const subscribePostBlock = (await getCachedGlobal(
    'subscribe-post-block',
  )()) as SubscribePostBlockType | null

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
    <article className="post bg-post">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="pt-0 pb-0">
        <div className="flex flex-col lg:grid lg:grid-cols-4">
          {/* Post Body: top on mobile, center 50% (cols 2–3) on desktop */}
          <div className="lg:col-start-2 lg:col-span-2 py-8 px-0 md:px-10">
            <RichText data={post.content} enableGutter={false} />
          </div>

          {/* Share: bottom on mobile, left 25% (col 1) on desktop — sticky */}
          <aside
            aria-label="Share this post"
            className="md:sticky flex flex-col justify-between lg:mt-0 lg:col-start-1 lg:row-start-1 py-8 px-10"
          >
            <div className="md:sticky md:top-0 py-6">
              <SocialShareBar
                slug={decodedSlug}
                title={post.title ?? ''}
                profiles={socialProfiles}
                keywords={keywordNames}
              />
            </div>
            {subscribePostBlock && (
              <div
                aria-label="subscribe-container"
                className="md:sticky md:bottom-0 flex flex-col justify-center items-end lg:items-start lg:align-middle"
              >
                <SubscribePostBlock
                  description={subscribePostBlock.description}
                  placeholder={subscribePostBlock.placeholder}
                  buttonText={subscribePostBlock.buttonText}
                  meta={subscribePostBlock.meta}
                  source={subscribePostBlock.source}
                />
              </div>
            )}
          </aside>
        </div>
        {relatedPosts.length > 0 && (
          <section className="mt-16 py-8 px-4" style={{ borderTop: '1px solid var(--border)' }}>
            <RelatedPosts docs={relatedPosts} />
          </section>
        )}
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
    depth: 2,
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
