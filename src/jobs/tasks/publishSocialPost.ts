import type { TaskConfig } from 'payload'
import type { Keyword, Post, SocialPost, SocialSetting } from '@/payload-types'
import type { SocialPlatform } from '@/utilities/buildShareUrl'
import { publishLinkedIn } from '@/lib/social/publishLinkedIn'
import { publishThreads } from '@/lib/social/publishThreads'
import { publishBlueSky } from '@/lib/social/publishBlueSky'
import { publishTwitter } from '@/lib/social/publishTwitter'
import { publishFacebook } from '@/lib/social/publishFacebook'
import { collectSocialPostImageUrls } from '@/utilities/collectSocialPostImageUrls'
import { getServerSideURL } from '@/utilities/getURL'
import { composePlatformBody, composeThreadsTopic } from '@/lib/social/composePlatformBody'
import type { PlatformEntry } from '@/collections/SocialPosts/types'

type ExistingShare = {
  platform: SocialPlatform
  sharedAt: string
  shareUrl?: string | null
  id?: string | null
}

type TaskIO = { input: { socialPostId: number; platform: string }; output: { publishedUrl: string } }

export const publishSocialPostTask: TaskConfig<TaskIO> = {
  slug: 'publishSocialPost',
  label: 'Publish Social Post',
  inputSchema: [
    { name: 'socialPostId', type: 'number', required: true },
    { name: 'platform', type: 'text', required: true },
  ],
  outputSchema: [
    { name: 'publishedUrl', type: 'text' },
  ],
  retries: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 60_000 },
  },
  onFail: async ({ input, req }) => {
    const { socialPostId, platform } = input as { socialPostId?: number; platform?: string }
    if (!socialPostId || !platform) return

    const fresh = (await req.payload.findByID({
      collection: 'social-posts',
      id: socialPostId,
      depth: 0,
      overrideAccess: true,
    })) as SocialPost

    const updatedPlatforms = ((fresh.platforms ?? []) as PlatformEntry[]).map((entry) =>
      entry.platform === platform ? { ...entry, status: 'failed' as const } : entry,
    )

    await req.payload.update({
      collection: 'social-posts',
      id: socialPostId,
      data: { platforms: updatedPlatforms },
      overrideAccess: true,
    })
  },
  handler: async ({ input, req }) => {
    const { socialPostId, platform } = input

    const doc = (await req.payload.findByID({
      collection: 'social-posts',
      id: socialPostId,
      depth: 2,
      overrideAccess: true,
    })) as SocialPost

    if (!doc) {
      throw new Error(`Social post ${socialPostId} not found`)
    }

    const platformEntries = (doc.platforms ?? []) as PlatformEntry[]
    const targetEntry = platformEntries.find((e) => e.platform === platform)

    if (!targetEntry) {
      throw new Error(`Platform entry "${platform}" not found in social post ${socialPostId}`)
    }

    if (targetEntry.status !== 'pending') {
      return { output: { publishedUrl: targetEntry.publishedUrl ?? '' } }
    }

    // Helper: fetch fresh doc, update the target platform entry, and save
    const updatePlatformEntry = async (updates: Partial<PlatformEntry>) => {
      const fresh = (await req.payload.findByID({
        collection: 'social-posts',
        id: socialPostId,
        depth: 0,
        overrideAccess: true,
      })) as SocialPost
      const updated = ((fresh.platforms ?? []) as PlatformEntry[]).map((entry) =>
        entry.platform === platform ? { ...entry, ...updates } : entry,
      )
      await req.payload.update({
        collection: 'social-posts',
        id: socialPostId,
        data: { platforms: updated },
        overrideAccess: true,
      })
    }

    await updatePlatformEntry({ status: 'processing' })

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

    const postUrl =
      postType === 'url'
        ? (doc.url?.trim() ?? doc.shortUrl?.trim() ?? linkedPostUrl)
        : undefined

    const imageUrls = postType === 'image' ? collectSocialPostImageUrls(doc) : []

    const keywords = (doc.keywords ?? []) as (number | Keyword)[]
    const resolvedKeywords = keywords.filter((k): k is Keyword => typeof k === 'object')

    // The literal text sent to this platform: the stored per-platform body, or composed
    // from the base body + keywords as a fallback for empty/legacy entries.
    const text = targetEntry.body?.trim()
      ? targetEntry.body
      : composePlatformBody(targetEntry.platform, doc.body, resolvedKeywords)

    let publishedUrl: string

    try {
      switch (platform) {
        case 'linkedin': {
          const li = social.linkedin
          if (!li?.accessToken || !li?.personUrn) {
            throw new Error('LinkedIn is not connected')
          }

          const result = await publishLinkedIn({
            body: text,
            url: postUrl,
            title: doc.metaTitle ?? undefined,
            description: doc.metaDescription ?? undefined,
            imageUrls,
            thumbnailUrl: doc.metaImageUrl ?? undefined,
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

          const topicTag = composeThreadsTopic(resolvedKeywords)

          const thPostUrl = postUrl

          // Threads honors only one topic tag (the first keyword via topicTag);
          // it does not support additional hashtags, so the body stays clean.
          const result = await publishThreads({
            body: text,
            topicTag,
            imageUrls,
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

          const result = await publishBlueSky({
            body: text,
            postUrl,
            title: doc.metaTitle ?? undefined,
            description: doc.metaDescription ?? undefined,
            imageUrl: doc.metaImageUrl ?? undefined,
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
            body: text,
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

        case 'facebook': {
          const fb = social.facebook
          if (!fb?.pageAccessToken || !fb?.pageId) {
            throw new Error('Facebook is not connected')
          }

          const result = await publishFacebook({
            message: text,
            link: postType === 'url' ? postUrl : undefined,
            imageUrls,
            settings: {
              pageAccessToken: fb.pageAccessToken,
              pageId: fb.pageId,
              expiresAt: fb.expiresAt,
            },
          })
          publishedUrl = result.url
          break
        }

        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      await updatePlatformEntry({ errorMessage })
      throw err
    }

    const now = new Date().toISOString()

    await updatePlatformEntry({ status: 'published', publishedAt: now, publishedUrl })

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
            { platform: platform as SocialPlatform, sharedAt: now, shareUrl: publishedUrl },
          ],
        },
        overrideAccess: true,
      })
    }

    return { output: { publishedUrl } }
  },
}
