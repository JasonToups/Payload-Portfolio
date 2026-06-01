import configPromise from '@payload-config'
import { getPayload } from 'payload'

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
        { status: { equals: 'pending' } },
        { scheduledFor: { less_than_equal: now } },
      ],
    },
    limit: 20,
    overrideAccess: true,
  })

  for (const doc of due.docs) {
    await payload.jobs.queue({
      task: 'publishSocialPost',
      input: { socialPostId: doc.id },
    })
  }

  const result = await payload.jobs.run({ overrideAccess: true })

  return Response.json({ queued: due.totalDocs, result })
}
