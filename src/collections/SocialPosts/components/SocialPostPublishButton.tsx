'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type PublishResponse =
  | { success: true; publishedUrl?: string; message?: string }
  | { success: false; error: string }

type StatusBadgeProps = { label: string; color: string }

function StatusBadge({ label, color }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        background: color,
        color: '#fff',
      }}
    >
      {label}
    </span>
  )
}

export default function SocialPostPublishButton() {
  const { id, savedDocumentData } = useDocumentInfo()
  const [publishing, setPublishing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; url?: string } | null>(
    null,
  )

  if (!id) return null

  const status = (savedDocumentData?.status ?? 'draft') as string
  const publishedUrl = savedDocumentData?.publishedUrl as string | undefined

  const canPublish = ['draft', 'failed', 'cancelled'].includes(status)
  const isPending = status === 'pending'
  const isProcessing = status === 'processing'
  const isPublished = status === 'published'

  const handlePublish = async () => {
    setPublishing(true)
    setResult(null)
    try {
      const res = await fetch(`/api/social-posts/${id as number}/publish`, { method: 'POST' })
      const data = (await res.json()) as PublishResponse
      if (data.success) {
        const url = 'publishedUrl' in data ? data.publishedUrl : undefined
        const message =
          url
            ? `Published successfully.`
            : ('message' in data ? data.message : undefined) ?? 'Queued — will publish shortly.'
        setResult({ success: true, message, url })
      } else {
        setResult({ success: false, message: data.error ?? 'Publish failed.' })
      }
    } catch {
      setResult({ success: false, message: 'Network error — try again.' })
    } finally {
      setPublishing(false)
    }
  }

  const handleCancel = async () => {
    try {
      await fetch(`/api/social-posts/${id as number}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      setResult({ success: true, message: 'Scheduled post cancelled.' })
    } catch {
      setResult({ success: false, message: 'Failed to cancel.' })
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '16px 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {canPublish && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            style={{
              padding: '8px 20px',
              background: publishing ? '#888' : '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: publishing ? 'not-allowed' : 'pointer',
            }}
          >
            {publishing ? 'Publishing…' : 'Publish Now'}
          </button>
        )}

        {isPending && (
          <>
            <StatusBadge label="Scheduled — Pending" color="#f59e0b" />
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </>
        )}

        {isProcessing && <StatusBadge label="Publishing…" color="#6366f1" />}

        {isPublished && (
          <>
            <StatusBadge label="Published" color="#10b981" />
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#0070f3' }}
              >
                View post ↗
              </a>
            )}
          </>
        )}
      </div>

      {result && (
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: result.success ? '#10b981' : '#ef4444',
          }}
        >
          {result.message}
          {result.url && (
            <>
              {' '}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0070f3' }}
              >
                View post ↗
              </a>
            </>
          )}
        </p>
      )}
    </div>
  )
}
