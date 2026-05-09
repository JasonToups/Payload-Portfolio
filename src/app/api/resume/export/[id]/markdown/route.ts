import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Resume } from '@/payload-types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params

  const resume = (await payload.findByID({
    collection: 'resumes',
    id,
    depth: 0,
  })) as Resume

  if (!resume.content) {
    return new Response('Resume content is empty', { status: 404 })
  }

  return new Response(resume.content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="resume.md"',
    },
  })
}
