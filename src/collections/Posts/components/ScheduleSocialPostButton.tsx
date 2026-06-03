'use client'

import { DatePicker, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import type { PlatformSlug } from '@/collections/SocialPosts/types'
import { ALL_PLATFORMS, PLATFORM_LABELS } from '@/collections/SocialPosts/types'

type PlatformStatus = 'unknown' | 'connected' | 'disconnected'
type SchedulePhase = 'idle' | 'composing' | 'saving' | 'saved' | 'sharing' | 'shared' | 'queued' | 'error'

type ScheduledPostDoc = {
  id: number
  platforms: { platform: PlatformSlug; status: string; publishedUrl?: string | null }[]
  scheduledFor?: string | null
}

type CreateSocialPostBody = {
  linkedPost: number
  platforms: PlatformSlug[]
  body: string
  scheduledFor: string
}

type CreateSocialPostBodyNow = {
  linkedPost: number
  platforms: PlatformSlug[]
  body: string
}

type PublishResponse = {
  success: boolean
  published?: string[]
  failed?: string[]
  queued?: string[]
  message?: string
  error?: string
}

// Twitter t.co shortens all URLs to 23 chars; \n\n separator = 2 chars
const TWITTER_MAX_CHARS = 280
const TWITTER_URL_CHARS = 23
const TWITTER_SEPARATOR_CHARS = 2

function getNextPublishDate(hourPacific: number): Date {
  const now = new Date()
  const pacificNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const pacificTarget = new Date(pacificNow)
  pacificTarget.setHours(hourPacific, 0, 0, 0)
  if (pacificTarget <= pacificNow) {
    pacificTarget.setDate(pacificTarget.getDate() + 1)
  }
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformSlug[]>(['linkedin'])
  const [body, setBody] = useState('')
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null)
  const [phase, setPhase] = useState<SchedulePhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [scheduled, setScheduled] = useState<ScheduledPostDoc[]>([])
  const [sharedUrls, setSharedUrls] = useState<string[]>([])

  const [statuses, setStatuses] = useState<Record<PlatformSlug, PlatformStatus>>({
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
    fetch(`/api/social-posts?where[linkedPost][equals]=${postId}&limit=20&depth=1`)
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

  const togglePlatform = (platform: PlatformSlug) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    )
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

  const validatePlatforms = (): string | null => {
    if (selectedPlatforms.length === 0) return 'Select at least one platform.'
    const disconnected = selectedPlatforms.filter((p) => statuses[p] !== 'connected')
    if (disconnected.length > 0) {
      return `${disconnected.map((p) => PLATFORM_LABELS[p]).join(', ')} ${disconnected.length === 1 ? 'is' : 'are'} not connected.`
    }
    return null
  }

  const twitterSelected = selectedPlatforms.includes('twitter')
  const twitterCharsUsed = body.length + TWITTER_SEPARATOR_CHARS + TWITTER_URL_CHARS
  const twitterCharsRemaining = TWITTER_MAX_CHARS - twitterCharsUsed

  const handleSchedule = async () => {
    if (!postId || !scheduledFor) return
    if (scheduledFor <= new Date()) {
      setError('Scheduled time must be in the future.')
      return
    }
    const validationError = validatePlatforms()
    if (validationError) {
      setError(validationError)
      return
    }
    if (twitterSelected && twitterCharsRemaining < 0) {
      setError('Tweet is too long.')
      return
    }

    setPhase('saving')
    setError(null)

    const requestBody: CreateSocialPostBody = {
      linkedPost: postId,
      platforms: selectedPlatforms,
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
    const validationError = validatePlatforms()
    if (validationError) {
      setError(validationError)
      return
    }
    if (twitterSelected && twitterCharsRemaining < 0) {
      setError('Tweet is too long.')
      return
    }

    setPhase('sharing')
    setError(null)

    const requestBody: CreateSocialPostBodyNow = { linkedPost: postId, platforms: selectedPlatforms, body }

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

      const urls = (publishData.published ?? [])
        .map((platform) => {
          const entry = created.platforms?.find((e) => e.platform === platform)
          return entry?.publishedUrl ?? null
        })
        .filter((u): u is string => Boolean(u))

      setSharedUrls(urls)
      setScheduled((prev) => [...prev, created])

      if ((publishData.queued?.length ?? 0) > 0) {
        setPhase('queued')
      } else {
        setPhase('shared')
      }

      setTimeout(() => {
        setPhase('composing')
        setSharedUrls([])
      }, 4000)
    } catch (err: unknown) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Failed to publish post')
    }
  }

  const handleCancel = async (docId: number) => {
    if (!window.confirm('Cancel this scheduled post?')) return
    try {
      // Cancel all pending platform entries by setting their status to cancelled
      const docRes = await fetch(`/api/social-posts/${docId}?depth=0`)
      const docData = (await docRes.json()) as ScheduledPostDoc
      const updatedPlatforms = (docData.platforms ?? []).map((e) =>
        e.status === 'pending' ? { ...e, status: 'cancelled' } : e,
      )
      await fetch(`/api/social-posts/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: updatedPlatforms }),
      })
      setScheduled((prev) =>
        prev.map((d) =>
          d.id === docId
            ? { ...d, platforms: (d.platforms ?? []).map((e) => e.status === 'pending' ? { ...e, status: 'cancelled' } : e) }
            : d,
        ),
      )
    } catch {
      setError('Failed to cancel scheduled post.')
    }
  }

  if (!postId) return null

  const pendingCount = scheduled.filter((d) =>
    (d.platforms ?? []).some((e) => e.status === 'pending'),
  ).length

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

          {/* Multi-select platform toggles */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {ALL_PLATFORMS.map((p) => {
              const selected = selectedPlatforms.includes(p)
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  style={{
                    alignItems: 'center',
                    background: selected ? 'var(--theme-success-100)' : 'var(--theme-elevation-0)',
                    border: `1px solid ${selected ? 'var(--theme-success-500)' : 'var(--theme-border)'}`,
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
              )
            })}
          </div>

          {/* Connection prompts for disconnected selected platforms */}
          {selectedPlatforms
            .filter((p) => statuses[p] === 'disconnected')
            .map((p) => (
              <div
                key={p}
                style={{
                  background: 'var(--theme-elevation-100)',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: 'var(--theme-text-dim)', fontSize: '12px' }}>
                  {PLATFORM_LABELS[p]} is not connected.{' '}
                </span>
                {p === 'twitter' && (
                  <button
                    className="btn btn--style-secondary btn--size-small"
                    onClick={handleConnectTwitter}
                    type="button"
                    style={{ fontSize: '12px', padding: '2px 8px' }}
                  >
                    Connect Twitter / X
                  </button>
                )}
                {p === 'threads' && (
                  <button
                    className="btn btn--style-secondary btn--size-small"
                    onClick={handleConnectThreads}
                    type="button"
                    style={{ fontSize: '12px', padding: '2px 8px' }}
                  >
                    Connect Threads
                  </button>
                )}
                {p === 'linkedin' && (
                  <span style={{ color: 'var(--theme-text-dim)', fontSize: '12px' }}>
                    Connect via the LinkedIn button above.
                  </span>
                )}
                {p === 'bluesky' && (
                  <span style={{ color: 'var(--theme-text-dim)', fontSize: '12px' }}>
                    Add your handle and app password in BlueSky Settings.
                  </span>
                )}
              </div>
            ))}

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

          {/* Twitter character counter (shown when Twitter is selected) */}
          {twitterSelected && (
            <div
              style={{
                color:
                  twitterCharsRemaining < 0
                    ? 'var(--theme-error-500)'
                    : twitterCharsRemaining <= 20
                      ? '#f59e0b'
                      : 'var(--theme-text-dim)',
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
              marginTop: twitterSelected ? '0' : '6px',
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
                selectedPlatforms.length === 0 ||
                selectedPlatforms.some((p) => statuses[p] !== 'connected') ||
                (twitterSelected && twitterCharsRemaining < 0)
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
                selectedPlatforms.length === 0 ||
                selectedPlatforms.some((p) => statuses[p] !== 'connected') ||
                (twitterSelected && twitterCharsRemaining < 0)
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

          {phase === 'shared' && sharedUrls.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sharedUrls.map((url) => (
                <p key={url} style={{ color: 'var(--theme-success-500)', fontSize: '12px', margin: 0 }}>
                  ✓ Published!{' '}
                  <a
                    href={url}
                    rel="noopener noreferrer"
                    style={{ color: 'var(--theme-success-500)' }}
                    target="_blank"
                  >
                    View →
                  </a>
                </p>
              ))}
            </div>
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
                {scheduled.map((doc) => {
                  const hasPending = (doc.platforms ?? []).some((e) => e.status === 'pending')
                  return (
                    <div
                      key={doc.id}
                      style={{
                        background: 'var(--theme-elevation-0)',
                        border: '1px solid var(--theme-border)',
                        borderRadius: '4px',
                        padding: '8px 10px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(doc.platforms ?? []).map((entry) => (
                            <span
                              key={entry.platform}
                              style={{
                                background:
                                  entry.status === 'published'
                                    ? 'var(--theme-success-100)'
                                    : entry.status === 'failed'
                                      ? 'var(--theme-error-100)'
                                      : entry.status === 'cancelled'
                                        ? 'var(--theme-elevation-200)'
                                        : 'var(--theme-warning-100)',
                                borderRadius: '3px',
                                color:
                                  entry.status === 'published'
                                    ? 'var(--theme-success-600)'
                                    : entry.status === 'failed'
                                      ? 'var(--theme-error-500)'
                                      : 'var(--theme-text-dim)',
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '1px 5px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {PLATFORM_LABELS[entry.platform]} · {entry.status}
                            </span>
                          ))}
                        </div>
                        {hasPending && (
                          <button
                            onClick={() => handleCancel(doc.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--theme-error-500)',
                              cursor: 'pointer',
                              fontSize: '11px',
                              padding: '2px 4px',
                              flexShrink: 0,
                            }}
                            type="button"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      {doc.scheduledFor && (
                        <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>
                          {formatDate(doc.scheduledFor)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
