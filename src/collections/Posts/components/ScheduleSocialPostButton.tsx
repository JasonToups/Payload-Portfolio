'use client'

import { DatePicker, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Platform = 'linkedin' | 'twitter' | 'bluesky' | 'threads'
type PlatformStatus = 'unknown' | 'connected' | 'disconnected'
type SchedulePhase = 'idle' | 'composing' | 'saving' | 'saved' | 'sharing' | 'shared' | 'queued' | 'error'

type ScheduledPostDoc = {
  id: number
  platform: Platform
  status: string
  scheduledFor?: string | null
  publishedUrl?: string | null
}

type CreateSocialPostBody = {
  linkedPost: number
  platform: Platform
  body: string
  scheduledFor: string
}

type CreateSocialPostBodyNow = {
  linkedPost: number
  platform: Platform
  body: string
}

type PublishResponse = {
  success: boolean
  publishedUrl?: string
  message?: string
  error?: string
}

const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
  bluesky: 'BlueSky',
  threads: 'Threads',
}

// Twitter t.co shortens all URLs to 23 chars; \n\n separator = 2 chars
const TWITTER_MAX_CHARS = 280
const TWITTER_URL_CHARS = 23
const TWITTER_SEPARATOR_CHARS = 2

function getNextPublishDate(hourPacific: number): Date {
  const now = new Date()
  // Interpret "now" in Pacific time
  const pacificNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const pacificTarget = new Date(pacificNow)
  pacificTarget.setHours(hourPacific, 0, 0, 0)
  // If that time has already passed today (Pacific), roll to tomorrow
  if (pacificTarget <= pacificNow) {
    pacificTarget.setDate(pacificTarget.getDate() + 1)
  }
  // Shift back to a real UTC Date by applying the same offset
  const utcOffset = now.getTime() - pacificNow.getTime()
  return new Date(pacificTarget.getTime() + utcOffset)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function openAuthPopup(url: string, messageKey: string, onConnect: () => void) {
  const popup = window.open(url, '_blank', 'width=600,height=700')
  const handler = (e: MessageEvent) => {
    if (e.origin !== window.location.origin) return
    if (e.data === messageKey) {
      window.removeEventListener('message', handler)
      popup?.close()
      onConnect()
    }
  }
  window.addEventListener('message', handler)
}

const StatusDot: React.FC<{ status: PlatformStatus }> = ({ status }) => {
  const color =
    status === 'connected' ? '#22c55e' : status === 'disconnected' ? '#ef4444' : '#9ca3af'
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        marginRight: 6,
        flexShrink: 0,
      }}
    />
  )
}

export const ScheduleSocialPostButton: React.FC = () => {
  const { id } = useDocumentInfo()

  const postId = id as number | undefined

  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>('linkedin')
  const [body, setBody] = useState('')
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null)
  const [phase, setPhase] = useState<SchedulePhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [scheduled, setScheduled] = useState<ScheduledPostDoc[]>([])
  const [sharedUrl, setSharedUrl] = useState<string | null>(null)

  const [statuses, setStatuses] = useState<Record<Platform, PlatformStatus>>({
    linkedin: 'unknown',
    twitter: 'unknown',
    bluesky: 'unknown',
    threads: 'unknown',
  })

  // Check platform connection statuses
  useEffect(() => {
    if (!isOpen) return

    fetch('/api/linkedin/status')
      .then((r) => r.json() as Promise<{ connected: boolean }>)
      .then((d) =>
        setStatuses((s) => ({ ...s, linkedin: d.connected ? 'connected' : 'disconnected' })),
      )
      .catch(() => setStatuses((s) => ({ ...s, linkedin: 'disconnected' })))

    fetch('/api/twitter/status')
      .then((r) => r.json() as Promise<{ connected: boolean }>)
      .then((d) =>
        setStatuses((s) => ({ ...s, twitter: d.connected ? 'connected' : 'disconnected' })),
      )
      .catch(() => setStatuses((s) => ({ ...s, twitter: 'disconnected' })))

    fetch('/api/bluesky/status')
      .then((r) => r.json() as Promise<{ connected: boolean }>)
      .then((d) =>
        setStatuses((s) => ({ ...s, bluesky: d.connected ? 'connected' : 'disconnected' })),
      )
      .catch(() => setStatuses((s) => ({ ...s, bluesky: 'disconnected' })))

    fetch('/api/threads/status')
      .then((r) => r.json() as Promise<{ connected: boolean }>)
      .then((d) =>
        setStatuses((s) => ({ ...s, threads: d.connected ? 'connected' : 'disconnected' })),
      )
      .catch(() => setStatuses((s) => ({ ...s, threads: 'disconnected' })))
  }, [isOpen])

  // Fetch existing scheduled posts for this post
  useEffect(() => {
    if (!postId || !isOpen) return
    fetch(`/api/social-posts?where[linkedPost][equals]=${postId}&limit=20&depth=0`)
      .then((r) => r.json() as Promise<{ docs: ScheduledPostDoc[] }>)
      .then((d) => setScheduled(d.docs ?? []))
      .catch(() => {})
  }, [postId, isOpen])

  const handleOpen = async () => {
    setIsOpen(true)
    setPhase('idle')
    setError(null)

    const postData = await (postId
      ? fetch(`/api/posts/${postId}?depth=1`).then((r) => r.json() as Promise<{ socialPostBody?: string | null }>)
      : Promise.resolve(null))

    if (postData?.socialPostBody) {
      setBody(postData.socialPostBody)
    }

    setScheduledFor(getNextPublishDate(6))
  }

  const handleClose = () => {
    setIsOpen(false)
    setPhase('idle')
    setError(null)
    setScheduledFor(null)
  }

  const handleConnectTwitter = () => {
    openAuthPopup('/api/twitter/auth', 'twitter-connected', () => {
      setStatuses((s) => ({ ...s, twitter: 'connected' }))
    })
  }

  const handleConnectThreads = () => {
    openAuthPopup('/api/threads/auth', 'threads-connected', () => {
      setStatuses((s) => ({ ...s, threads: 'connected' }))
    })
  }

  const handleSchedule = async () => {
    if (!postId || !scheduledFor) return
    if (scheduledFor <= new Date()) {
      setError('Scheduled time must be in the future.')
      return
    }
    if (statuses[platform] !== 'connected') {
      setError(`${PLATFORM_LABELS[platform]} is not connected.`)
      return
    }

    setPhase('saving')
    setError(null)

    const requestBody: CreateSocialPostBody = {
      linkedPost: postId,
      platform,
      body,
      scheduledFor: scheduledFor.toISOString(),
    }

    try {
      const res = await fetch('/api/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const json = (await res.json()) as { errors?: { message: string }[] }
        throw new Error(json.errors?.[0]?.message ?? 'Failed to schedule post')
      }

      const { doc: created } = (await res.json()) as { doc: ScheduledPostDoc }
      setScheduled((prev) => [...prev, created])
      setPhase('saved')
      setScheduledFor(null)
      setTimeout(() => setPhase('composing'), 2000)
    } catch (err: unknown) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Failed to schedule post')
    }
  }

  const handleShareNow = async () => {
    if (!postId) return
    if (statuses[platform] !== 'connected') {
      setError(`${PLATFORM_LABELS[platform]} is not connected.`)
      return
    }

    setPhase('sharing')
    setError(null)

    const requestBody: CreateSocialPostBodyNow = { linkedPost: postId, platform, body }

    try {
      const createRes = await fetch('/api/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!createRes.ok) {
        const json = (await createRes.json()) as { errors?: { message: string }[] }
        throw new Error(json.errors?.[0]?.message ?? 'Failed to create post')
      }

      const { doc: created } = (await createRes.json()) as { doc: ScheduledPostDoc }

      const publishRes = await fetch(`/api/social-posts/${created.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const publishData = (await publishRes.json()) as PublishResponse

      if (!publishRes.ok && !publishData.success) {
        throw new Error(publishData.error ?? 'Failed to publish post')
      }

      if (publishData.publishedUrl) {
        setSharedUrl(publishData.publishedUrl)
        setScheduled((prev) => [
          ...prev,
          { ...created, status: 'published', publishedUrl: publishData.publishedUrl },
        ])
        setPhase('shared')
      } else {
        setScheduled((prev) => [...prev, { ...created, status: 'pending' }])
        setPhase('queued')
      }

      setTimeout(() => {
        setPhase('composing')
        setSharedUrl(null)
      }, 4000)
    } catch (err: unknown) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Failed to publish post')
    }
  }

  const handleCancel = async (docId: number) => {
    if (!window.confirm('Cancel this scheduled post?')) return
    try {
      await fetch(`/api/social-posts/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      setScheduled((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: 'cancelled' } : d)),
      )
    } catch {
      setError('Failed to cancel scheduled post.')
    }
  }

  if (!postId) return null

  const pendingCount = scheduled.filter((d) => d.status === 'pending').length

  // Twitter character counter: body + \n\n + t.co URL (always 23 chars)
  const twitterCharsUsed = body.length + TWITTER_SEPARATOR_CHARS + TWITTER_URL_CHARS
  const twitterCharsRemaining = TWITTER_MAX_CHARS - twitterCharsUsed

  return (
    <div
      style={{ borderTop: '1px solid var(--theme-border)', paddingTop: '16px', marginTop: '8px' }}
    >
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
        Schedule Social Media Post
      </p>
      {!isOpen ? (
        <button
          className="btn btn--style-secondary btn--size-medium"
          onClick={handleOpen}
          type="button"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          📅 Schedule a Post
          {pendingCount > 0 && (
            <span
              style={{
                background: 'var(--theme-success-500)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '11px',
                padding: '1px 6px',
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>
      ) : (
        <div
          style={{
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-border)',
            borderRadius: '6px',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <p style={{ color: 'var(--theme-text)', fontSize: '13px', fontWeight: 600, margin: 0 }}>
              Schedule a Social Post
            </p>
            <button
              aria-label="Close"
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--theme-text-dim)',
                cursor: 'pointer',
                fontSize: '16px',
              }}
              type="button"
            >
              ×
            </button>
          </div>

          {/* Platform selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {(['linkedin', 'twitter', 'bluesky', 'threads'] as Platform[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                style={{
                  alignItems: 'center',
                  background:
                    platform === p ? 'var(--theme-success-100)' : 'var(--theme-elevation-0)',
                  border: `1px solid ${platform === p ? 'var(--theme-success-500)' : 'var(--theme-border)'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  fontSize: '12px',
                  gap: '4px',
                  padding: '4px 10px',
                }}
                type="button"
              >
                <StatusDot status={statuses[p]} />
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>

          {/* Connection prompt for selected platform */}
          {statuses[platform] === 'disconnected' && (
            <div
              style={{
                background: 'var(--theme-elevation-100)',
                borderRadius: '4px',
                marginBottom: '10px',
                padding: '8px 12px',
              }}
            >
              <span style={{ color: 'var(--theme-text-dim)', fontSize: '12px' }}>
                {PLATFORM_LABELS[platform]} is not connected.{' '}
              </span>
              {platform === 'twitter' && (
                <button
                  className="btn btn--style-secondary btn--size-small"
                  onClick={handleConnectTwitter}
                  type="button"
                  style={{ fontSize: '12px', padding: '2px 8px' }}
                >
                  Connect Twitter / X
                </button>
              )}
              {platform === 'threads' && (
                <button
                  className="btn btn--style-secondary btn--size-small"
                  onClick={handleConnectThreads}
                  type="button"
                  style={{ fontSize: '12px', padding: '2px 8px' }}
                >
                  Connect Threads
                </button>
              )}
              {platform === 'linkedin' && (
                <span style={{ color: 'var(--theme-text-dim)', fontSize: '12px' }}>
                  Connect via the LinkedIn button above.
                </span>
              )}
              {platform === 'bluesky' && (
                <span style={{ color: 'var(--theme-text-dim)', fontSize: '12px' }}>
                  Add your handle and app password in BlueSky Settings.
                </span>
              )}
            </div>
          )}

          {/* Post body */}
          <textarea
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            style={{
              background: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-border)',
              borderRadius: '4px',
              color: 'var(--theme-text)',
              fontSize: '13px',
              marginBottom: '4px',
              padding: '8px',
              resize: 'vertical',
              width: '100%',
            }}
            value={body}
          />

          {/* Twitter character counter */}
          {platform === 'twitter' && (
            <div
              style={{
                color: twitterCharsRemaining < 0 ? 'var(--theme-error-500)' : twitterCharsRemaining <= 20 ? '#f59e0b' : 'var(--theme-text-dim)',
                fontSize: '11px',
                marginBottom: '6px',
                textAlign: 'right',
              }}
            >
              {twitterCharsRemaining} chars remaining (post URL appended automatically)
            </div>
          )}

          {/* Date/time picker */}
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '12px',
              marginTop: platform === 'twitter' ? '0' : '6px',
            }}
          >
            <span
              style={{ color: 'var(--theme-text-dim)', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              Schedule for:
            </span>
            <DatePicker
              onChange={(val) => setScheduledFor(val instanceof Date ? val : null)}
              pickerAppearance="dayAndTime"
              value={scheduledFor ?? undefined}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn--style-primary btn--size-small"
              disabled={
                phase === 'sharing' ||
                statuses[platform] !== 'connected' ||
                (platform === 'twitter' && twitterCharsRemaining < 0)
              }
              onClick={handleShareNow}
              type="button"
            >
              {phase === 'sharing'
                ? 'Publishing...'
                : phase === 'shared'
                  ? '✓ Published!'
                  : phase === 'queued'
                    ? 'Queued!'
                    : 'Share Now'}
            </button>
            <button
              className="btn btn--style-secondary btn--size-small"
              disabled={
                !scheduledFor ||
                phase === 'saving' ||
                statuses[platform] !== 'connected' ||
                (platform === 'twitter' && twitterCharsRemaining < 0)
              }
              onClick={handleSchedule}
              type="button"
            >
              {phase === 'saving'
                ? 'Scheduling...'
                : phase === 'saved'
                  ? '✓ Scheduled!'
                  : 'Schedule Post'}
            </button>
            <button
              className="btn btn--style-secondary btn--size-small"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </button>
          </div>

          {error && (
            <p style={{ color: 'var(--theme-error-500)', fontSize: '12px', marginTop: '8px' }}>
              {error}
            </p>
          )}

          {phase === 'shared' && sharedUrl && (
            <p style={{ color: 'var(--theme-success-500)', fontSize: '12px', marginTop: '8px' }}>
              ✓ Published!{' '}
              <a
                href={sharedUrl}
                rel="noopener noreferrer"
                style={{ color: 'var(--theme-success-500)' }}
                target="_blank"
              >
                View →
              </a>
            </p>
          )}

          {phase === 'queued' && (
            <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '8px' }}>
              Queued — will publish in ~35s (Threads requires a brief wait).
            </p>
          )}

          {/* Existing scheduled posts list */}
          {scheduled.length > 0 && (
            <div
              style={{
                borderTop: '1px solid var(--theme-border)',
                marginTop: '14px',
                paddingTop: '10px',
              }}
            >
              <p
                style={{
                  color: 'var(--theme-text-dim)',
                  fontSize: '11px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Scheduled Posts
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {scheduled.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      alignItems: 'center',
                      background: 'var(--theme-elevation-0)',
                      border: '1px solid var(--theme-border)',
                      borderRadius: '4px',
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>
                        {PLATFORM_LABELS[doc.platform]}
                      </span>
                      <span
                        style={{
                          background:
                            doc.status === 'published'
                              ? 'var(--theme-success-100)'
                              : doc.status === 'failed'
                                ? 'var(--theme-error-100)'
                                : doc.status === 'cancelled'
                                  ? 'var(--theme-elevation-200)'
                                  : 'var(--theme-warning-100)',
                          borderRadius: '3px',
                          color:
                            doc.status === 'published'
                              ? 'var(--theme-success-600)'
                              : doc.status === 'failed'
                                ? 'var(--theme-error-500)'
                                : 'var(--theme-text-dim)',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {doc.status}
                      </span>
                      {doc.scheduledFor && (
                        <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>
                          {formatDate(doc.scheduledFor)}
                        </span>
                      )}
                    </div>
                    {doc.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(doc.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--theme-error-500)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          padding: '2px 4px',
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    )}
                    {doc.status === 'published' && doc.publishedUrl && (
                      <a
                        href={doc.publishedUrl}
                        rel="noopener noreferrer"
                        style={{ color: 'var(--theme-success-500)', fontSize: '11px' }}
                        target="_blank"
                      >
                        View →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
