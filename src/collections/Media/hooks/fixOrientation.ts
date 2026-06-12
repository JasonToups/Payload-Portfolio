import type { CollectionBeforeOperationHook } from 'payload'
import sharp from 'sharp'

const SKIP_MIMETYPES = new Set(['image/gif', 'image/svg+xml'])

export const fixOrientation: CollectionBeforeOperationHook = async ({ args, operation }) => {
  if (operation !== 'create' && operation !== 'update') return args

  const file = args?.req?.file
  if (!file?.data) return args

  const { mimetype } = file
  if (!mimetype?.startsWith('image/') || SKIP_MIMETYPES.has(mimetype)) return args

  const processed = await sharp(file.data).autoOrient().toBuffer()

  args.req.file = {
    ...file,
    data: processed,
    size: processed.length,
  }

  return args
}
