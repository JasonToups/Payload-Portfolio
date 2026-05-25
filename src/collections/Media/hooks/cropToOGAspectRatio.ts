import type { CollectionBeforeOperationHook } from 'payload'
import sharp from 'sharp'

const OG_WIDTH = 1200
const OG_HEIGHT = 630
const OG_RATIO = OG_WIDTH / OG_HEIGHT

const SKIP_MIMETYPES = new Set(['image/gif', 'image/svg+xml'])

export const cropToOGAspectRatio: CollectionBeforeOperationHook = async ({
  args,
  operation,
}) => {
  if (operation !== 'create' && operation !== 'update') return args

  const file = args?.req?.file
  if (!file?.data) return args

  const { mimetype } = file
  if (!mimetype?.startsWith('image/') || SKIP_MIMETYPES.has(mimetype)) return args

  const { width, height } = await sharp(file.data).metadata()
  if (!width || !height) return args

  const currentRatio = width / height

  let cropWidth: number
  let cropHeight: number

  if (currentRatio > OG_RATIO) {
    cropWidth = Math.round(height * OG_RATIO)
    cropHeight = height
  } else {
    cropWidth = width
    cropHeight = Math.round(width / OG_RATIO)
  }

  if (cropWidth > OG_WIDTH) {
    cropWidth = OG_WIDTH
    cropHeight = OG_HEIGHT
  }

  if (cropWidth === width && cropHeight === height) return args

  const processed = await sharp(file.data)
    .resize(cropWidth, cropHeight, { fit: 'cover', position: 'centre' })
    .toBuffer()

  args.req.file = {
    ...file,
    data: processed,
    size: processed.length,
  }

  return args
}
