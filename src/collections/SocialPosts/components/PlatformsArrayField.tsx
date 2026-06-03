'use client'

import { useField } from '@payloadcms/ui'
import { useState } from 'react'
import type { PlatformEntry, PlatformPublishStatus, PlatformSlug } from '../types'
import { ALL_PLATFORMS, PLATFORM_LABELS } from '../types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const STATUS_STYLES: Record<
  PlatformPublishStatus,
  { background: string; color: string; label: string }
> = {
  draft: { background: 'transparent', color: 'var(--theme-text-dim)', label: 'Draft' },
  pending: { background: 'var(--theme-warning-100)', color: '#92400e', label: 'Pending' },
  processing: { background: '#dbeafe', color: '#1e40af', label: 'Processing…' },
  published: { background: 'var(--theme-success-100)', color: 'var(--theme-success-600)', label: 'Published' },
  failed: { background: 'var(--theme-error-100)', color: 'var(--theme-error-500)', label: 'Failed' },
  cancelled: { background: 'var(--theme-elevation-200)', color: 'var(--theme-text-dim)', label: 'Cancelled' },
}

function StatusBadge({ status }: { status: PlatformPublishStatus }) {
  if (status === 'draft') return null
  const style = STATUS_STYLES[status]
  return (
    <span
      style={{
        background: style.background,
        borderRadius: '3px',
        color: style.color,
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        padding: '2px 6px',
        textTransform: 'uppercase',
      }}
    >
      {status === 'processing' && (
        <span
          style={{
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
            marginRight: '3px',
          }}
        >
          ↻
        </span>
      )}
      {style.label}
    </span>
  )
}

function PlatformSection({
  entry,
  onRemove,
}: {
  entry: PlatformEntry
  onRemove: () => void
}) {
  const isLocked = entry.status === 'processing' || entry.status === 'published'

  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-border)',
        borderRadius: '6px',
        marginBottom: '8px',
        padding: '10px 12px',
      }}
    >
      {/* Header row */}
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: entry.status !== 'draft' ? '8px' : '0',
        }}
      >
        <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--theme-text)', fontSize: '13px', fontWeight: 600 }}>
            {PLATFORM_LABELS[entry.platform]}
          </span>
          <StatusBadge status={entry.status} />
        </div>
        {!isLocked && (
          <button
            aria-label={`Remove ${PLATFORM_LABELS[entry.platform]}`}
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--theme-text-dim)',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              padding: '0 2px',
            }}
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {/* Published details */}
      {entry.status === 'published' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {entry.publishedAt && (
            <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>
              {formatDate(entry.publishedAt)}
            </span>
          )}
          {entry.publishedUrl && (
            <a
              href={entry.publishedUrl}
              rel="noopener noreferrer"
              style={{ color: 'var(--theme-success-500)', fontSize: '12px' }}
              target="_blank"
            >
              View post →
            </a>
          )}
        </div>
      )}

      {/* Failed details */}
      {entry.status === 'failed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {entry.errorMessage && (
            <span
              style={{
                color: 'var(--theme-error-500)',
                fontSize: '11px',
                fontStyle: 'italic',
              }}
            >
              &ldquo;{entry.errorMessage}&rdquo;
            </span>
          )}
          <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>
            Remove and re-add this platform to retry.
          </span>
        </div>
      )}

      {/* Pending / Processing detail */}
      {(entry.status === 'pending' || entry.status === 'processing') && (
        <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>
          {entry.status === 'pending' ? 'Waiting to publish…' : 'Publishing…'}
        </span>
      )}
    </div>
  )
}

export function PlatformsArrayField() {
  const { value, setValue } = useField<PlatformEntry[]>({ path: 'platforms' })
  const [addOpen, setAddOpen] = useState(false)

  const entries: PlatformEntry[] = value ?? []

  const usedPlatforms = new Set(entries.map((e) => e.platform))
  const availablePlatforms = ALL_PLATFORMS.filter((p) => !usedPlatforms.has(p))

  const handleRemove = (platform: PlatformSlug) => {
    setValue(entries.filter((e) => e.platform !== platform))
  }

  const handleAdd = (platform: PlatformSlug) => {
    setValue([...entries, { platform, status: 'draft' }])
    setAddOpen(false)
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <p
        style={{
          color: 'var(--theme-text-dim)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}
      >
        Platforms
      </p>

      {entries.length === 0 && (
        <p style={{ color: 'var(--theme-text-dim)', fontSize: '12px', marginBottom: '8px' }}>
          No platforms selected. Add one below.
        </p>
      )}

      {entries.map((entry) => (
        <PlatformSection
          key={entry.platform}
          entry={entry}
          onRemove={() => handleRemove(entry.platform)}
        />
      ))}

      {availablePlatforms.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAddOpen((v) => !v)}
            style={{
              alignItems: 'center',
              background: 'var(--theme-elevation-0)',
              border: '1px dashed var(--theme-border)',
              borderRadius: '4px',
              color: 'var(--theme-text-dim)',
              cursor: 'pointer',
              display: 'flex',
              fontSize: '12px',
              gap: '4px',
              padding: '6px 12px',
              width: '100%',
            }}
            type="button"
          >
            + Add Platform
          </button>

          {addOpen && (
            <div
              style={{
                background: 'var(--theme-elevation-0)',
                border: '1px solid var(--theme-border)',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                left: 0,
                position: 'absolute',
                top: '100%',
                width: '100%',
                zIndex: 10,
              }}
            >
              {availablePlatforms.map((p) => (
                <button
                  key={p}
                  onClick={() => handleAdd(p)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)',
                    cursor: 'pointer',
                    display: 'block',
                    fontSize: '13px',
                    padding: '8px 12px',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  type="button"
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
