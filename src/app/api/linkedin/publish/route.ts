import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { type SocialPlatform } from '@/utilities/buildShareUrl'

type PublishRequest = {
  postId: number
  text: string
  url: string
  title: string
  description?: string
}

type LinkedInSettingsData = {
  accessToken?: string | null
  expiresAt?: string | null
  personUrn?: string | null
}

type ExistingShare = {
  platform: SocialPlatform
  sharedAt: string
  shareUrl?: string | null
  id?: string | null
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as PublishRequest
  const { postId, text, url, title, description } = body

  if (!postId || !text || !url || !title) {
    return NextResponse.json({ error: 'postId, text, url, and title are required.' }, { status: 400 })
  }

  const settings = (await payload.findGlobal({
    slug: 'linkedin-settings',
  })) as unknown as LinkedInSettingsData

  if (!settings.accessToken || !settings.personUrn) {
    return NextResponse.json(
      { error: 'LinkedIn is not connected. Use the Connect LinkedIn button first.' },
      { status: 403 },
    )
  }

  if (settings.expiresAt && new Date(settings.expiresAt) <= new Date()) {
    return NextResponse.json(
      { error: 'LinkedIn token has expired. Re-authorize from the admin panel.' },
      { status: 403 },
    )
  }

  const linkedInBody = {
    author: settings.personUrn,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED' },
    content: {
      article: {
        source: url,
        title,
        ...(description ? { description } : {}),
      },
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }

  const linkedInRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202605',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(linkedInBody),
  })

  if (!linkedInRes.ok) {
    const errorBody = await linkedInRes.text()
    return NextResponse.json({ error: `LinkedIn API error: ${errorBody}` }, { status: 502 })
  }

  const linkedInPostId = linkedInRes.headers.get('x-restli-id') ?? undefined

  const post = await payload.findByID({ collection: 'posts', id: postId, depth: 0 })
  const existingShares = ((post.socialShares ?? []) as ExistingShare[])

  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      socialShares: [
        ...existingShares,
        {
          platform: 'linkedin',
          sharedAt: new Date().toISOString(),
          ...(linkedInPostId
            ? { shareUrl: `https://www.linkedin.com/feed/update/${linkedInPostId}` }
            : {}),
        },
      ],
    },
  })

  return NextResponse.json({ success: true, linkedInPostId })
}
