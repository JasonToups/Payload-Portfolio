import { createLocalReq, getPayload } from 'payload'
import { seedPosts } from '@/endpoints/seed/seed-posts'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 120

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const payloadReq = await createLocalReq({ user }, payload)
    await seedPosts({ payload, req: payloadReq })
    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding posts' })
    return new Response('Error seeding posts.', { status: 500 })
  }
}
