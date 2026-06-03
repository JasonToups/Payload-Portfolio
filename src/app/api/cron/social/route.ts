import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { SocialPost } from '@/payload-types'
import type { PlatformEntry } from '@/collections/SocialPosts/types'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  const now = new Date().toISOString()

  const due = await payload.find({
    collection: 'social-posts',
    where: {
      and: [
        { 'platforms.status': { equals: 'pending' } },
        { scheduledFor: { less_than_equal: now } },
      ],
    },
    limit: 20,
    overrideAccess: true,
  })

  let queued = 0

  for (const doc of due.docs as SocialPost[]) {
    const platformEntries = (doc.platforms ?? []) as PlatformEntry[]
    const pendingEntries = platformEntries.filter((e) => e.status === 'pending')

    for (const entry of pendingEntries) {
      await payload.jobs.queue({
        task: 'publishSocialPost',
        input: { socialPostId: doc.id, platform: entry.platform },
      })
      queued++
    }
  }

  const result = await payload.jobs.run({ overrideAccess: true })

  return Response.json({ queued, result })
}
