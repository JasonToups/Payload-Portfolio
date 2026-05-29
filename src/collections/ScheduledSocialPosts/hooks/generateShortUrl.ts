import { randomBytes } from 'crypto'
import type { CollectionBeforeChangeHook } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

function generateCode(): string {
  return randomBytes(3).toString('hex')
}

export const generateShortUrl: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const postId = typeof data.post === 'object' ? (data.post as { id: number }).id : data.post
  if (!postId) return data

  const post = await req.payload.findByID({
    collection: 'posts',
    id: postId as number,
    depth: 0,
    overrideAccess: true,
  })

  if (!post?.slug) return data

  const targetUrl = `${getServerSideURL()}/posts/${post.slug}`

  const shortUrlDoc = await req.payload.create({
    collection: 'short-urls',
    data: {
      code: generateCode(),
      targetUrl,
      post: post.id,
    },
    draft: false,
    overrideAccess: true,
  })

  return {
    ...data,
    shortUrl: `${getServerSideURL()}/s/${shortUrlDoc.code}`,
  }
}
