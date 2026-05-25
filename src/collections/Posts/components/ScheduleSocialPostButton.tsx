'use client'

import { DatePicker, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Platform = 'linkedin' | 'bluesky' | 'threads'
type PlatformStatus = 'unknown' | 'connected' | 'disconnected'
type SchedulePhase = 'idle' | 'composing' | 'saving' | 'saved' | 'error'

type ScheduledPostDoc = {
  id: number
  platform: Platform
  status: string
  scheduledFor: string
  publishedUrl?: string | null
}

type CreateScheduledPostBody = {
  post: number
  platform: Platform
  body: string
  scheduledFor: string
  status: string
}

const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  bluesky: 'BlueSky',
  threads: 'Threads',
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
  const { id, savedDocumentData } = useDocumentInfo()

  const postId = id as number | undefined

  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>('linkedin')
  const [body, setBody] = useState('')
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null)
  const [phase, setPhase] = useState<SchedulePhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [scheduled, setScheduled] = useState<ScheduledPostDoc[]>([])

  const [statuses, setStatuses] = useState<Record<Platform, PlatformStatus>>({
    linkedin: 'unknown',
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

    fetch('/api/bluesky/status')
      .then((r) => r.json() as Promise<{ connected: boolean }>)
      .then((d) =>
        setStatuses((s) => ({ ...s, bluesky: d.connected ? 'connected' : 'disconnected' })),
      )
      .catch(() => setStatuses((s) => ({ ...s, bluesky: 'disconnected' })))
  }, [isOpen])

  // Fetch existing scheduled posts for this post
  useEffect(() => {
    if (!postId || !isOpen) return
    fetch(`/api/scheduled-social-posts?where[post][equals]=${postId}&limit=20&depth=0`)
      .then((r) => r.json() as Promise<{ docs: ScheduledPostDoc[] }>)
      .then((d) => setScheduled(d.docs ?? []))
      .catch(() => {})
  }, [postId, isOpen])

  const handleOpen = async () => {
    setIsOpen(true)
    setPhase('idle')
    setError(null)
    if (postId) {
      try {
        const res = await fetch(`/api/posts/${postId}?depth=1`)
        const data = (await res.json()) as { socialPostBody?: string | null }
        setBody(data.socialPostBody ?? '')
      } catch {
        setBody('')
      }
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setPhase('idle')
    setError(null)
    setScheduledFor(null)
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

    const payload: CreateScheduledPostBody = {
      post: postId,
      platform,
      body,
      scheduledFor: scheduledFor.toISOString(),
      status: 'pending',
    }

    try {
      const res = await fetch('/api/scheduled-social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = (await res.json()) as { errors?: { message: string }[] }
        throw new Error(json.errors?.[0]?.message ?? 'Failed to schedule post')
      }

      const created = (await res.json()) as ScheduledPostDoc
      setScheduled((prev) => [...prev, created])
      setPhase('saved')
      setScheduledFor(null)
      setTimeout(() => setPhase('composing'), 2000)
    } catch (err: unknown) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Failed to schedule post')
    }
  }

  const handleCancel = async (docId: number) => {
    if (!window.confirm('Cancel this scheduled post?')) return
    try {
      await fetch(`/api/scheduled-social-posts/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      setScheduled((prev) => prev.map((d) => (d.id === docId ? { ...d, status: 'cancelled' } : d)))
    } catch {
      setError('Failed to cancel scheduled post.')
    }
  }

  if (!postId) return null

  const pendingCount = scheduled.filter((d) => d.status === 'pending').length

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
            {(['linkedin', 'bluesky', 'threads'] as Platform[]).map((p) => (
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
              marginBottom: '10px',
              padding: '8px',
              resize: 'vertical',
              width: '100%',
            }}
            value={body}
          />

          {/* Date/time picker */}
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '12px',
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn--style-primary btn--size-small"
              disabled={!scheduledFor || phase === 'saving' || statuses[platform] !== 'connected'}
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
                      <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>
                        {formatDate(doc.scheduledFor)}
                      </span>
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
