import type { Media } from '../payload-types'
import { getServerSideURL } from './getURL'

type ResolveOptions = {
  /**
   * Named size variant from the Media `sizes` object (e.g. `'thumbnail'`, `'small'`).
   * Falls back to the original URL/filename if the variant wasn't generated.
   */
  size?: keyof NonNullable<Media['sizes']>
  /**
   * Allow localhost URLs. Set to true for the admin Live Preview, where the
   * browser can reach localhost. Leave false (default) for sent emails.
   */
  preview?: boolean
  /**
   * Serve images through the /media/ proxy route so URLs align with the
   * sending domain (updates.toupsi.com) rather than the Vercel Blob CDN.
   * Automatically ignored on localhost where the proxy URL is unreachable
   * for external email clients.
   */
  email?: boolean
}

function getVercelBlobUrl(filename: string): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return null
  // Mirror the URL pattern from @payloadcms/storage-vercel-blob/dist/generateURL.js:
  // `https://${storeId}.public.blob.vercel-storage.com/${filename}`
  const storeId = token.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]?.toLowerCase()
  if (!storeId) return null
  return `https://${storeId}.public.blob.vercel-storage.com/${encodeURIComponent(filename)}`
}

/**
 * Resolves a publicly accessible URL from a Payload Media document for use in emails.
 *
 * Resolution order:
 * 1. `sizes[size].url` (if `size` is set) — selects a named generated variant
 * 2. `media.url` — the stored URL (absolute Vercel Blob URL for recent uploads)
 * 3. Vercel Blob URL constructed from `BLOB_READ_WRITE_TOKEN` + filename
 *    (handles legacy uploads where the URL was stored as a relative path)
 * 4. `getServerSideURL()` + relative path — filtered out if localhost unless `preview`
 */
export function resolvePayloadImageUrl(
  image: Media | number | null | undefined,
  options: ResolveOptions = {},
): string | null {
  if (!image || typeof image === 'number') return null

  const { size, preview = false, email = false } = options

  const sizeVariant = size ? (image.sizes?.[size] ?? null) : null
  const url = sizeVariant?.url ?? image.url
  const filename = sizeVariant?.filename ?? image.filename

  const serverUrl = getServerSideURL()
  const useProxy = email && !serverUrl.includes('localhost')

  if (useProxy && filename) {
    return `${serverUrl}/media/${encodeURIComponent(filename)}`
  }

  if (url) {
    if (url.startsWith('https://')) return url
    if (url.startsWith('http://')) {
      if (url.includes('localhost') && !preview) return null
      return url
    }
  }

  // Relative path — construct the canonical Vercel Blob URL from token + filename
  if (filename) {
    const blobUrl = getVercelBlobUrl(filename)
    if (blobUrl) return blobUrl
  }

  // Final fallback — prepend server URL, block if localhost unless preview
  if (!url) return null
  const resolved = `${serverUrl}${url}`
  if (resolved.startsWith('http://localhost') && !preview) return null
  return resolved
}
