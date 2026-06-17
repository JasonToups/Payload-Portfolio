'use client'

import { useDocumentInfo, useField, useForm, useFormFields } from '@payloadcms/ui'
import { useMemo, useState } from 'react'
import type { PlatformEntry, PlatformPublishStatus, PlatformSlug } from '../types'
import { ALL_PLATFORMS, PLATFORM_LABELS } from '../types'
import { formatDateWithSettingsTimezone, useSettingsTimezone } from './useSettingsTimezone'

interface PlatformRow extends PlatformEntry {
  rowIndex: number
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
  settingsTimezone,
}: {
  entry: PlatformEntry
  onRemove: () => void
  settingsTimezone: string | null
}) {
  const isLocked = entry.status === 'processing' || entry.status === 'published'
  const publishedAtFormatted =
    entry.publishedAt && settingsTimezone
      ? formatDateWithSettingsTimezone({ iso: entry.publishedAt, settingsTimezone })
      : null

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
          {publishedAtFormatted && (
            <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>
              {publishedAtFormatted.primary}
              {publishedAtFormatted.local && ` · Local: ${publishedAtFormatted.local}`}
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
  const { id: docId } = useDocumentInfo()
  const settingsTimezone = useSettingsTimezone()
  const [addOpen, setAddOpen] = useState(false)
  const { dispatchFields } = useForm()
  const { value: titleValue, setValue: setTitleValue } = useField<string>({ path: 'title' })

  // Read platforms from indexed form fields — Payload stores array row count at 'platforms'
  // and individual field values at 'platforms.N.fieldName'.
  // useField({ path: 'platforms' }) returns the count (number), not the array.
  const formStateJSON = useFormFields(([fields]) => {
    const count = typeof fields['platforms']?.value === 'number' ? (fields['platforms'].value as number) : 0
    const rows: PlatformRow[] = []
    for (let i = 0; i < count; i++) {
      const platform = fields[`platforms.${i}.platform`]?.value as PlatformSlug | undefined
      if (!platform) continue
      rows.push({
        rowIndex: i,
        platform,
        status: (fields[`platforms.${i}.status`]?.value as PlatformPublishStatus) ?? 'draft',
        publishedAt: (fields[`platforms.${i}.publishedAt`]?.value as string | null) ?? null,
        publishedUrl: (fields[`platforms.${i}.publishedUrl`]?.value as string | null) ?? null,
        errorMessage: (fields[`platforms.${i}.errorMessage`]?.value as string | null) ?? null,
      })
    }
    return JSON.stringify({ count, rows })
  })

  const { rowCount, entries } = useMemo<{ rowCount: number; entries: PlatformRow[] }>(() => {
    try {
      const parsed = JSON.parse(formStateJSON) as { count: number; rows: PlatformRow[] }
      return { rowCount: parsed.count, entries: parsed.rows }
    } catch {
      return { rowCount: 0, entries: [] }
    }
  }, [formStateJSON])

  const usedPlatforms = new Set(entries.map((e) => e.platform))
  const availablePlatforms = ALL_PLATFORMS.filter((p) => !usedPlatforms.has(p))

  // Rebuild the title whenever the platforms list changes.
  // Strips any existing " — Platform1, Platform2" suffix and appends the new one.
  // Only runs on new documents to avoid overwriting manually customised titles.
  const syncTitle = (nextEntries: PlatformEntry[]) => {
    if (docId) return
    const base = (titleValue ?? '').replace(/ — .+$/, '').trim()
    if (!base) return
    const suffix = nextEntries.map((e) => PLATFORM_LABELS[e.platform]).join(', ')
    setTitleValue(suffix ? `${base} — ${suffix}` : base)
  }

  const handleRemove = (platform: PlatformSlug) => {
    const row = entries.find((e) => e.platform === platform)
    if (!row) return
    dispatchFields({ type: 'REMOVE_ROW', path: 'platforms', rowIndex: row.rowIndex })
    const next = entries.filter((e) => e.platform !== platform)
    syncTitle(next)
  }

  const handleAdd = (platform: PlatformSlug) => {
    // If there are uninitialized empty rows (e.g. from minRows: 1), fill the first one
    // rather than appending a new row — otherwise the empty row fails 'required' validation.
    const usedIndices = new Set(entries.map((e) => e.rowIndex))
    let targetIndex = -1
    for (let i = 0; i < rowCount; i++) {
      if (!usedIndices.has(i)) {
        targetIndex = i
        break
      }
    }

    if (targetIndex !== -1) {
      dispatchFields({ type: 'UPDATE', path: `platforms.${targetIndex}.platform`, value: platform })
    } else {
      // rowIndex omitted → Payload appends at end; new row lands at index rowCount
      dispatchFields({ type: 'ADD_ROW', path: 'platforms' })
      dispatchFields({ type: 'UPDATE', path: `platforms.${rowCount}.platform`, value: platform })
    }

    const newRowIndex = targetIndex !== -1 ? targetIndex : rowCount
    const next = [...entries, { rowIndex: newRowIndex, platform, status: 'draft' as const }]
    syncTitle(next)
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
          settingsTimezone={settingsTimezone}
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
