import type { TaskConfig } from 'payload'
import type { Keyword, ScheduledSocialPost, SocialSetting } from '@/payload-types'
import type { SocialPlatform } from '@/utilities/buildShareUrl'
import { publishLinkedIn } from '@/lib/social/publishLinkedIn'
import { publishThreads } from '@/lib/social/publishThreads'
import { publishBlueSky } from '@/lib/social/publishBlueSky'
import { publishTwitter } from '@/lib/social/publishTwitter'
import { getServerSideURL } from '@/utilities/getURL'

function sanitizeTopicTag(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, '')
}

type ExistingShare = {
  platform: SocialPlatform
  sharedAt: string
  shareUrl?: string | null
  id?: string | null
}

type TaskIO = { input: { scheduledPostId: number }; output: { publishedUrl: string } }

export const publishScheduledSocialPostTask: TaskConfig<TaskIO> = {
  slug: 'publishScheduledSocialPost',
  label: 'Publish Scheduled Social Post',
  inputSchema: [
    {
      name: 'scheduledPostId',
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
    const id = (input as { scheduledPostId?: number }).scheduledPostId
    if (!id) return
    await req.payload.update({
      collection: 'scheduled-social-posts',
      id,
      data: { status: 'failed', errorMessage: 'Failed after 2 attempts — check platform credentials.' },
      overrideAccess: true,
    })
  },
  handler: async ({ input, req }) => {
    const { scheduledPostId } = input

    const doc = (await req.payload.findByID({
      collection: 'scheduled-social-posts',
      id: scheduledPostId,
      depth: 2,
      overrideAccess: true,
    })) as ScheduledSocialPost

    if (!doc) {
      throw new Error(`Scheduled social post ${scheduledPostId} not found`)
    }

    // Idempotency guard — skip if already processed
    if (doc.status !== 'pending') {
      return { output: { publishedUrl: doc.publishedUrl ?? '' } }
    }

    await req.payload.update({
      collection: 'scheduled-social-posts',
      id: scheduledPostId,
      data: { status: 'processing' },
      overrideAccess: true,
    })

    const post = typeof doc.post === 'object' ? doc.post : null
    if (!post) throw new Error('Post relationship not populated')

    const postUrl = `${getServerSideURL()}/posts/${post.slug}`
    let publishedUrl: string

    const social = (await req.payload.findGlobal({
      slug: 'social-settings',
      overrideAccess: true,
    })) as SocialSetting

    switch (doc.platform) {
      case 'linkedin': {
        const li = social.linkedin
        if (!li?.accessToken || !li?.personUrn) {
          throw new Error('LinkedIn is not connected')
        }

        const heroImage = typeof post.heroImage === 'object' ? post.heroImage : null
        const imageUrl = heroImage
          ? (heroImage.sizes?.og?.url ?? heroImage.url ?? undefined)
          : undefined
        const description = post.meta?.description ?? undefined

        const result = await publishLinkedIn({
          body: doc.body,
          url: postUrl,
          title: post.title,
          description,
          imageUrl,
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

        const keywords = (post.keywords ?? []) as (number | Keyword)[]
        const firstKeyword = typeof keywords[0] === 'object' ? keywords[0] : null
        const topicTag = firstKeyword ? sanitizeTopicTag(firstKeyword.name) || undefined : undefined

        const result = await publishThreads({
          body: `${doc.body}\n\n${postUrl}`,
          topicTag,
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

        const heroImage = typeof post.heroImage === 'object' ? post.heroImage : null
        const imageUrl = heroImage?.url ?? undefined
        const metaDescription = post.meta?.description ?? undefined

        const result = await publishBlueSky({
          body: doc.body,
          postUrl,
          title: post.title,
          description: metaDescription,
          imageUrl,
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

    const now = new Date().toISOString()

    // Update the scheduled post to published
    await req.payload.update({
      collection: 'scheduled-social-posts',
      id: scheduledPostId,
      data: { status: 'published', publishedAt: now, publishedUrl },
      overrideAccess: true,
    })

    // Append to the post's socialShares log
    const freshPost = await req.payload.findByID({
      collection: 'posts',
      id: post.id,
      depth: 0,
      overrideAccess: true,
    })

    const existingShares = ((freshPost.socialShares ?? []) as ExistingShare[])
    await req.payload.update({
      collection: 'posts',
      id: post.id,
      data: {
        socialShares: [
          ...existingShares,
          {
            platform: doc.platform as SocialPlatform,
            sharedAt: now,
            shareUrl: publishedUrl,
          },
        ],
      },
      overrideAccess: true,
    })

    return { output: { publishedUrl } }
  },
}
