'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

import { buildShareUrl, type ShareOptions, type SocialPlatform } from '@/utilities/buildShareUrl'

type SocialShare = {
  platform: SocialPlatform
  sharedAt: string
  shareUrl?: string | null
  id?: string | null
}

type KeywordRef = { id: number; name: string }

type PostData = {
  socialShares?: SocialShare[] | null
  keywords?: (number | KeywordRef)[] | null
  socialPostBody?: string | null
}

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'threads', label: 'Threads' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'linkedin', label: 'LinkedIn' },
]

const SocialShareButton: React.FC = () => {
  const [loadingPlatform, setLoadingPlatform] = useState<SocialPlatform | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmedShares, setConfirmedShares] = useState<SocialPlatform[]>([])

  const { id, savedDocumentData } = useDocumentInfo()

  const isNewDoc = !id
  const isPublished = savedDocumentData?._status === 'published'
  const slug = savedDocumentData?.slug as string | undefined
  const title = (savedDocumentData?.title as string | undefined) ?? ''
  if (isNewDoc) return null

  const postUrl =
    typeof window !== 'undefined' && slug ? `${window.location.origin}/posts/${slug}` : ''

  const handleShare = async (platform: SocialPlatform) => {
    if (!isPublished || !id || !postUrl) return

    setLoadingPlatform(platform)
    setError(null)

    try {
      const fetchRes = await fetch(`/api/posts/${id}?depth=1`)
      const postData = (await fetchRes.json()) as PostData
      const existingShares: SocialShare[] = postData.socialShares ?? []

      const newShare: SocialShare = { platform, sharedAt: new Date().toISOString() }

      const patchRes = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialShares: [...existingShares, newShare] }),
      })

      if (!patchRes.ok) {
        setError('Failed to record share — try again.')
        return
      }

      setConfirmedShares((prev) => [...prev, platform])
      const hashtags = (postData.keywords ?? [])
        .filter((k): k is KeywordRef => typeof k === 'object')
        .map((k) => k.name)
      const options: ShareOptions =
        platform === 'twitter'
          ? { text: postData.socialPostBody ?? title, hashtags }
          : {}
      window.open(buildShareUrl(platform, postUrl, title, options), '_blank', 'noopener,noreferrer')
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setLoadingPlatform(null)
    }
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <p
        style={{
          color: 'var(--theme-text-dim)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '12px',
          textTransform: 'uppercase',
        }}
      >
        Quick Share
      </p>

      {!isPublished && (
        <p style={{ fontSize: '12px', color: 'var(--theme-text-dim)', marginBottom: '12px' }}>
          Publish this post to enable sharing
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {PLATFORMS.map(({ value, label }) => {
          const wasShared = confirmedShares.includes(value)
          const isLoading = loadingPlatform === value

          return (
            <div
              key={value}
              title={!isPublished ? 'Publish this post before sharing' : undefined}
              style={!isPublished ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
            >
              <button
                type="button"
                onClick={() => handleShare(value)}
                disabled={!isPublished || loadingPlatform !== null}
                className="btn btn--style-secondary btn--size-medium"
                style={{
                  fontSize: '1rem',
                  padding: '0.625rem 1.25rem',
                  margin: '0.5rem 1rem',
                  ...(!isPublished ? { pointerEvents: 'none' } : {}),
                }}
              >
                {isLoading ? 'Sharing…' : wasShared ? `${label} ✓` : `Share on ${label}`}
              </button>
            </div>
          )
        })}
      </div>

      {confirmedShares.length > 0 && (
        <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--theme-text-dim)' }}>
          Reload to see updated share history above.
        </p>
      )}

      {error && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--theme-error-500)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default SocialShareButton
