import type { PayloadHandler } from 'payload'

export const categoryPostsHandler: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const categoryId = req.searchParams?.get('categoryId')
  const rawLimit = req.searchParams?.get('limit')
  const limit = rawLimit ? Math.min(Number(rawLimit), 50) : 3

  if (!categoryId) {
    return Response.json({ error: 'categoryId is required' }, { status: 400 })
  }

  const result = await req.payload.find({
    collection: 'posts',
    where: {
      and: [{ _status: { equals: 'published' } }, { categories: { in: [categoryId] } }],
    },
    sort: '-publishedAt',
    limit,
    overrideAccess: true,
  })

  return Response.json({ postIds: result.docs.map((p) => p.id), total: result.totalDocs })
}
