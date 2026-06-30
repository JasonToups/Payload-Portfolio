import { type NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { fetchOpenGraph } from '@/utilities/fetchOpenGraph'

export const maxDuration = 30

/**
 * Resolve Open Graph / link-card metadata for a URL on behalf of the admin
 * editor. Runs server-side so the client can scrape external sites without
 * hitting CORS. Auth-gated to logged-in users, mirroring the publish route.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl.searchParams.get('url')?.trim()

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only http(s) URLs are supported' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const meta = await fetchOpenGraph(url)

  return NextResponse.json(meta)
}
