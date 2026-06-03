'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

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
  meta?: { description?: string | null } | null
}

type LinkedInStatusResponse = { connected: boolean }
type LinkedInPublishResponse = { success?: boolean; error?: string; linkedInPostId?: string }
type ShortUrlResponse = { shortUrl?: string; error?: string }

type ModalResult = { success: boolean; message: string }

type LinkedInData = {
  defaultText: string
  hashtags: string[]
  description: string
}

const CHAR_LIMIT = 3000

function buildComposedText(text: string, url: string, hashtags: string[]): string {
  const hashtagString = hashtags.length
    ? hashtags.map((h) => `#${h.replace(/ /g, '_')}`).join(' ')
    : ''
  const bodyWithHashtags = hashtagString ? `${text.trim()} ${hashtagString}` : text
  return [bodyWithHashtags, url].filter(Boolean).join('\n\n')
}

type LinkedInComposeProps = {
  postId: number
  postUrl: string
  defaultText: string
  hashtags: string[]
  title: string
  description: string
  onClose: () => void
  onPublished: () => void
}

const LinkedInCompose: React.FC<LinkedInComposeProps> = ({
  postId,
  postUrl,
  defaultText,
  hashtags,
  title,
  description,
  onClose,
  onPublished,
}) => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')
  const [text, setText] = useState(() => buildComposedText(defaultText, postUrl, hashtags))
  const [publishing, setPublishing] = useState(false)
  const [result, setResult] = useState<ModalResult | null>(null)

  useEffect(() => {
    fetch('/api/linkedin/status')
      .then((r) => r.json())
      .then((data: LinkedInStatusResponse) =>
        setStatus(data.connected ? 'connected' : 'disconnected'),
      )
      .catch(() => setStatus('disconnected'))
  }, [])

  const handleConnect = () => {
    const popup = window.open('/api/linkedin/auth', 'linkedin-oauth', 'width=600,height=700')
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data === 'linkedin-connected') {
        setStatus('connected')
        window.removeEventListener('message', handleMessage)
        popup?.close()
      }
    }
    window.addEventListener('message', handleMessage)
  }

  const handlePublish = async () => {
    setPublishing(true)
    setResult(null)
    try {
      const res = await fetch('/api/linkedin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          text,
          url: postUrl,
          title,
          description,
        }),
      })
      const data = (await res.json()) as LinkedInPublishResponse
      if (data.success) {
        setResult({ success: true, message: 'Published to LinkedIn!' })
        onPublished()
      } else {
        setResult({ success: false, message: data.error ?? 'Publish failed.' })
      }
    } catch {
      setResult({ success: false, message: 'Network error — try again.' })
    } finally {
      setPublishing(false)
    }
  }

  const statusColor =
    status === 'connected' ? '#22c55e' : status === 'disconnected' ? '#ef4444' : '#9ca3af'
  const statusLabel =
    status === 'loading'
      ? 'Checking connection…'
      : status === 'connected'
        ? 'Connected'
        : 'Not connected'

  return (
    <div
      style={{
        marginTop: '16px',
        border: '1px solid var(--theme-border)',
        borderRadius: '6px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: statusColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '13px', color: 'var(--theme-text-dim)' }}>{statusLabel}</span>
        {status === 'disconnected' && (
          <button
            type="button"
            onClick={handleConnect}
            className="btn btn--style-secondary btn--size-small"
            style={{ marginLeft: '8px' }}
          >
            Connect LinkedIn
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--theme-text-dim)',
          }}
        >
          Post Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          style={{
            width: '100%',
            resize: 'vertical',
            padding: '8px',
            border: '1px solid var(--theme-border)',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            background: 'var(--theme-input-bg)',
            color: text.length > CHAR_LIMIT ? '#ef4444' : 'var(--theme-text)',
            boxSizing: 'border-box',
          }}
        />
        <span
          style={{
            fontSize: '12px',
            color: text.length > CHAR_LIMIT ? '#ef4444' : 'var(--theme-text-dim)',
            textAlign: 'right',
          }}
        >
          {text.length} / {CHAR_LIMIT}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--theme-text-dim)',
          }}
        >
          Link Card URL
        </span>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--theme-text-dim)',
            wordBreak: 'break-all',
          }}
        >
          {postUrl}
        </p>
      </div>

      {result && (
        <p style={{ margin: 0, fontSize: '13px', color: result.success ? '#22c55e' : '#ef4444' }}>
          {result.message}
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn--style-secondary btn--size-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handlePublish()}
          disabled={
            status !== 'connected' || publishing || text.length > CHAR_LIMIT || text.length === 0
          }
          className="btn btn--style-primary btn--size-medium"
        >
          {publishing ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </div>
  )
}

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'threads', label: 'Threads' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'linkedin', label: 'LinkedIn' },
]

const SocialShareButton: React.FC = () => {
  const { id, savedDocumentData } = useDocumentInfo()

  const [loadingPlatform, setLoadingPlatform] = useState<SocialPlatform | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmedShares, setConfirmedShares] = useState<SocialPlatform[]>(() =>
    ((savedDocumentData?.socialShares as SocialShare[] | null | undefined) ?? []).map(
      (s) => s.platform,
    ),
  )
  const [linkedInModalOpen, setLinkedInModalOpen] = useState(false)
  const [linkedInData, setLinkedInData] = useState<LinkedInData | null>(null)

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
      const tag = hashtags[0]

      // Use a short URL for platforms where the URL is part of the post body
      let shareUrl = postUrl
      if (platform === 'threads' || platform === 'bluesky') {
        try {
          const shortRes = await fetch(`/api/posts/short-url?postId=${id}`)
          const shortData = (await shortRes.json()) as ShortUrlResponse
          if (shortData.shortUrl) shareUrl = shortData.shortUrl
        } catch {
          // fall through — use full postUrl on failure
        }
      }

      const options: ShareOptions =
        platform === 'twitter'
          ? { text: postData.socialPostBody ?? title, hashtags }
          : platform === 'threads'
            ? { text: postData.socialPostBody ?? title, tag }
            : platform === 'bluesky'
              ? { text: postData.socialPostBody ?? title, hashtags }
              : {}
      window.open(buildShareUrl(platform, shareUrl, options), '_blank', 'noopener,noreferrer')
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setLoadingPlatform(null)
    }
  }

  const handleLinkedInClick = async () => {
    if (!isPublished || !id || !postUrl) return

    setLoadingPlatform('linkedin')
    setError(null)

    try {
      const fetchRes = await fetch(`/api/posts/${id}?depth=1`)
      const postData = (await fetchRes.json()) as PostData
      const hashtags = (postData.keywords ?? [])
        .filter((k): k is KeywordRef => typeof k === 'object')
        .map((k) => k.name)
      setLinkedInData({
        defaultText: postData.socialPostBody ?? '',
        hashtags,
        description: postData.meta?.description ?? '',
      })
      setLinkedInModalOpen(true)
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
          const isLinkedIn = value === 'linkedin'

          return (
            <div
              key={value}
              title={!isPublished ? 'Publish this post before sharing' : undefined}
              style={!isPublished ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
            >
              <button
                type="button"
                onClick={() => (isLinkedIn ? void handleLinkedInClick() : void handleShare(value))}
                disabled={!isPublished || loadingPlatform !== null}
                className="btn btn--style-secondary btn--size-medium"
                style={{
                  ...(!isPublished ? { pointerEvents: 'none' } : {}),
                }}
              >
                {isLoading
                  ? isLinkedIn
                    ? 'Loading…'
                    : 'Sharing…'
                  : wasShared
                    ? `${label} ✓`
                    : isLinkedIn
                      ? `Post to ${label}`
                      : `Share on ${label}`}
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

      {linkedInModalOpen && linkedInData && (
        <LinkedInCompose
          postId={id as number}
          postUrl={postUrl}
          defaultText={linkedInData.defaultText}
          hashtags={linkedInData.hashtags}
          title={title}
          description={linkedInData.description}
          onClose={() => setLinkedInModalOpen(false)}
          onPublished={() => {
            setConfirmedShares((prev) => [...prev, 'linkedin'])
            setLinkedInModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default SocialShareButton
