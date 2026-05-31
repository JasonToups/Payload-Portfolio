import { randomBytes } from 'crypto'
import type { CollectionBeforeChangeHook } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

export const socialPostBeforeChange: CollectionBeforeChangeHook = async ({ data, req }) => {
  const postId =
    data.linkedPost && typeof data.linkedPost === 'object'
      ? (data.linkedPost as { id: number }).id
      : (data.linkedPost as number | null | undefined)

  if (postId && !data.shortUrl) {
    const post = await req.payload.findByID({
      collection: 'posts',
      id: postId,
      depth: 0,
      overrideAccess: true,
    })

    if (post?.slug) {
      const code = randomBytes(3).toString('hex')
      const targetUrl = `${getServerSideURL()}/posts/${post.slug}`
      await req.payload.create({
        collection: 'short-urls',
        data: { code, targetUrl, post: post.id },
        overrideAccess: true,
      })
      data.shortUrl = `${getServerSideURL()}/s/${code}`
    }
  }

  if (data.scheduledFor && data.status === 'draft') {
    data.status = 'pending'
  }

  if (!data.scheduledFor && data.status === 'pending') {
    data.status = 'draft'
  }

  return data
}
