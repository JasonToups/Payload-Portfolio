import type { CollectionBeforeOperationHook } from 'payload'
import sharp from 'sharp'

const MAX_WIDTH = 1200
const MAX_HEIGHT = 630

const SKIP_MIMETYPES = new Set(['image/gif', 'image/svg+xml'])

export const constrainToOGBounds: CollectionBeforeOperationHook = async ({ args, operation }) => {
  if (operation !== 'create' && operation !== 'update') return args

  const file = args?.req?.file
  if (!file?.data) return args

  const { mimetype } = file
  if (!mimetype?.startsWith('image/') || SKIP_MIMETYPES.has(mimetype)) return args

  const { width, height } = await sharp(file.data).metadata()
  if (!width || !height) return args

  if (width <= MAX_WIDTH && height <= MAX_HEIGHT) return args

  const processed = await sharp(file.data)
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .toBuffer()

  args.req.file = {
    ...file,
    data: processed,
    size: processed.length,
  }

  return args
}
