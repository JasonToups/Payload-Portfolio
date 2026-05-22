// Rewrite Vercel Blob absolute URLs to the /media proxy route (same-origin).
// Relative paths are returned as-is — Next.js Image resolves them natively without
// needing a remotePatterns entry, avoiding www vs. non-www hostname mismatches.
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const encodedTag = cacheTag && cacheTag !== '' ? encodeURIComponent(cacheTag) : null

  // Route Vercel Blob absolute URLs through the /media proxy route
  const blobMatch = url.match(/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/(.+)$/)
  if (blobMatch) {
    return encodedTag ? `/media/${blobMatch[1]}?${encodedTag}` : `/media/${blobMatch[1]}`
  }

  // Already absolute (non-blob) — return as-is with optional cache tag
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return encodedTag ? `${url}?${encodedTag}` : url
  }

  // Relative path — return as-is (works with Next.js Image and <video> natively)
  return encodedTag ? `${url}?${encodedTag}` : url
}
