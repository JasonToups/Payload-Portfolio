import type { PayloadHandler } from 'payload'

export const keywordPostsHandler: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const keywordId = req.searchParams?.get('keywordId')
  const rawLimit = req.searchParams?.get('limit')
  const limit = rawLimit ? Math.min(Number(rawLimit), 50) : 3

  if (!keywordId) {
    return Response.json({ error: 'keywordId is required' }, { status: 400 })
  }

  const result = await req.payload.find({
    collection: 'posts',
    where: {
      and: [{ _status: { equals: 'published' } }, { keywords: { in: [keywordId] } }],
    },
    sort: '-publishedAt',
    limit,
    overrideAccess: true,
  })

  return Response.json({ postIds: result.docs.map((p) => p.id), total: result.totalDocs })
}
