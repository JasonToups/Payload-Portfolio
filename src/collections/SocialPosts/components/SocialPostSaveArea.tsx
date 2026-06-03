'use client'

import { SaveButton, useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
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
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

export function SocialPostSaveArea() {
  const { id, savedDocumentData } = useDocumentInfo()
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; url?: string } | null>(
    null,
  )

  const status = (savedDocumentData?.status ?? 'draft') as string
  const publishedUrl = savedDocumentData?.publishedUrl as string | undefined

  const canPublish = id && ['draft', 'failed', 'cancelled'].includes(status)
  const isPending = id && status === 'pending'
  const isProcessing = id && status === 'processing'
  const isPublished = id && status === 'published'

  const handlePublish = async () => {
    if (!id) return
    setPublishing(true)
    setResult(null)
    try {
      const res = await fetch(`/api/social-posts/${id as number}/publish`, { method: 'POST' })
      const data = (await res.json()) as PublishResponse
      if (data.success) {
        const url = 'publishedUrl' in data ? data.publishedUrl : undefined
        const message = url
          ? 'Published!'
          : ('message' in data ? data.message : undefined) ?? 'Queued — will publish shortly.'
        setResult({ success: true, message, url })
      } else {
        // Error is written to the errorMessage field in the sidebar — refresh to show it there
        setResult(null)
      }
    } catch {
      setResult({ success: false, message: 'Network error — try again.' })
    } finally {
      setPublishing(false)
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {canPublish && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="btn btn--style-secondary btn--size-medium"
          >
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
        )}

        {isPending && <StatusBadge label="Scheduled" color="#f59e0b" />}
        {isProcessing && <StatusBadge label="Publishing…" color="#6366f1" />}
        {isPublished && (
          <>
            <StatusBadge label="Published" color="#10b981" />
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: 'var(--theme-success-500)', whiteSpace: 'nowrap' }}
              >
                View ↗
              </a>
            )}
          </>
        )}

        <SaveButton />
      </div>

      {result && (
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: result.success ? '#10b981' : '#ef4444',
            textAlign: 'right',
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
