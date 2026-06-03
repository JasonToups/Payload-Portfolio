import type { TaskConfig } from 'payload'
import type { Keyword, Post, SocialPost, SocialSetting } from '@/payload-types'
import type { SocialPlatform } from '@/utilities/buildShareUrl'
import { publishLinkedIn } from '@/lib/social/publishLinkedIn'
import { publishThreads } from '@/lib/social/publishThreads'
import { publishBlueSky } from '@/lib/social/publishBlueSky'
import { publishTwitter } from '@/lib/social/publishTwitter'
import { collectSocialPostImageUrls } from '@/utilities/collectSocialPostImageUrls'
import { getServerSideURL } from '@/utilities/getURL'

type ExistingShare = {
  platform: SocialPlatform
  sharedAt: string
  shareUrl?: string | null
  id?: string | null
}

function sanitizeTopicTag(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, '')
}

type TaskIO = { input: { socialPostId: number }; output: { publishedUrl: string } }

export const publishSocialPostTask: TaskConfig<TaskIO> = {
  slug: 'publishSocialPost',
  label: 'Publish Social Post',
  inputSchema: [
    {
      name: 'socialPostId',
      type: 'number',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'publishedUrl',
      type: 'text',
    },
  ],
  retries: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 60_000 },
  },
  onFail: async ({ input, req }) => {
    const id = (input as { socialPostId?: number }).socialPostId
    if (!id) return
    // errorMessage was already written by the handler on each failed attempt —
    // here we just mark the final status so the admin shows the real error.
    await req.payload.update({
      collection: 'social-posts',
      id,
      data: { status: 'failed' },
      overrideAccess: true,
    })
  },
  handler: async ({ input, req }) => {
    const { socialPostId } = input

    const doc = (await req.payload.findByID({
      collection: 'social-posts',
      id: socialPostId,
      depth: 2,
      overrideAccess: true,
    })) as SocialPost

    if (!doc) {
      throw new Error(`Social post ${socialPostId} not found`)
    }

    if (doc.status !== 'pending') {
      return { output: { publishedUrl: doc.publishedUrl ?? '' } }
    }

    await req.payload.update({
      collection: 'social-posts',
      id: socialPostId,
      data: { status: 'processing' },
      overrideAccess: true,
    })

    const social = (await req.payload.findGlobal({
      slug: 'social-settings',
      overrideAccess: true,
    })) as SocialSetting

    const linkedPost =
      typeof doc.linkedPost === 'object' && doc.linkedPost !== null
        ? (doc.linkedPost as Post)
        : null

    const postType = doc.postType ?? 'url'

    const linkedPostUrl = linkedPost
      ? `${getServerSideURL()}/posts/${linkedPost.slug}`
      : undefined

    // URL embed — only for URL-type posts; falls back through url field → shortUrl → derived slug URL
    const postUrl =
      postType === 'url'
        ? (doc.url ?? doc.shortUrl ?? linkedPostUrl)
        : undefined

    // Images — only for Image-type posts
    const imageUrls = postType === 'image' ? collectSocialPostImageUrls(doc) : []

    const keywords = (doc.keywords ?? []) as (number | Keyword)[]
    const resolvedKeywords = keywords.filter((k): k is Keyword => typeof k === 'object')

    const hashtagString = resolvedKeywords
      .map((k) => `#${k.name.replace(/\s+/g, '')}`)
      .join(' ')

    let publishedUrl: string

    try {
    switch (doc.platform) {
      case 'linkedin': {
        const li = social.linkedin
        if (!li?.accessToken || !li?.personUrn) {
          throw new Error('LinkedIn is not connected')
        }

        const liHashtags = resolvedKeywords
          .map((k) => `#${k.name.replace(/ /g, '_')}`)
          .join(' ')
        const liCommentary = liHashtags ? `${doc.body}\n\n${liHashtags}` : doc.body

        const result = await publishLinkedIn({
          body: liCommentary,
          url: postUrl,
          title: linkedPost?.title,
          description: linkedPost?.meta?.description ?? undefined,
          imageUrls,
          settings: {
            accessToken: li.accessToken,
            personUrn: li.personUrn,
            expiresAt: li.expiresAt,
          },
        })
        publishedUrl = result.url
        break
      }

      case 'threads': {
        const th = social.threads
        if (!th?.accessToken || !th?.userId) {
          throw new Error('Threads is not connected')
        }

        const firstKeyword = resolvedKeywords[0] ?? null
        const topicTag = firstKeyword ? sanitizeTopicTag(firstKeyword.name) || undefined : undefined

        // Use the direct post URL for Threads — short URLs aren't followed by Threads' link scraper,
        // which causes the link card to resolve to the homepage instead of the post.
        const thPostUrl = postUrl

        const thBody = [
          doc.body,
          ...(thPostUrl ? [thPostUrl] : []),
          ...(hashtagString ? [hashtagString] : []),
        ].join('\n\n')

        const result = await publishThreads({
          body: thBody,
          topicTag,
          imageUrls,
          // link_attachment explicitly sets the link card URL for text-only posts (per Meta docs)
          linkAttachment: imageUrls.length === 0 ? thPostUrl : undefined,
          settings: {
            accessToken: th.accessToken,
            userId: th.userId,
            expiresAt: th.expiresAt,
          },
        })
        publishedUrl = result.url
        break
      }

      case 'bluesky': {
        const appPassword = process.env.BLUESKY_APP_PASSWORD
        if (!appPassword) {
          throw new Error('BLUESKY_APP_PASSWORD is not set')
        }

        const blueskyProfile = social.profiles?.find((p) => p.platform === 'bluesky')
        const blueskyUrl = blueskyProfile?.url ?? ''
        let handle: string | null = null
        try {
          const segments = new URL(blueskyUrl).pathname.split('/').filter(Boolean)
          handle = segments[1] ?? null
        } catch {
          handle = null
        }

        if (!handle) {
          throw new Error('BlueSky profile URL is not set in Social Settings')
        }

        const bskyDescription = [linkedPost?.meta?.description, hashtagString || null]
          .filter(Boolean)
          .join('\n\n') || undefined

        const result = await publishBlueSky({
          body: doc.body,
          postUrl,
          title: linkedPost?.title,
          description: bskyDescription,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          settings: { handle, appPassword },
        })
        publishedUrl = result.url
        break
      }

      case 'twitter': {
        const tw = social.twitter
        if (!tw?.accessToken) {
          throw new Error('Twitter is not connected')
        }

        const result = await publishTwitter({
          body: doc.body,
          postUrl,
          imageUrls,
          settings: {
            accessToken: tw.accessToken,
            refreshToken: tw.refreshToken,
            expiresAt: tw.expiresAt,
            username: tw.username,
          },
        })
        publishedUrl = result.url
        break
      }

      default:
        throw new Error(`Unsupported platform: ${doc.platform}`)
    }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      await req.payload.update({
        collection: 'social-posts',
        id: socialPostId,
        data: { errorMessage },
        overrideAccess: true,
      })
      throw err
    }

    const now = new Date().toISOString()

    await req.payload.update({
      collection: 'social-posts',
      id: socialPostId,
      data: { status: 'published', publishedAt: now, publishedUrl },
      overrideAccess: true,
    })

    if (linkedPost) {
      const freshPost = await req.payload.findByID({
        collection: 'posts',
        id: linkedPost.id,
        depth: 0,
        overrideAccess: true,
      })
      const existingShares = ((freshPost.socialShares ?? []) as ExistingShare[])
      await req.payload.update({
        collection: 'posts',
        id: linkedPost.id,
        data: {
          socialShares: [
            ...existingShares,
            { platform: doc.platform as SocialPlatform, sharedAt: now, shareUrl: publishedUrl },
          ],
        },
        overrideAccess: true,
      })
    }

    return { output: { publishedUrl } }
  },
}
