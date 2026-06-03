'use client'

import { DatePicker, useField } from '@payloadcms/ui'
import { useState } from 'react'

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

export function ScheduledForField() {
  const { value, setValue } = useField<string | null>({ path: 'scheduledFor' })
  const [pickerOpen, setPickerOpen] = useState(false)
  const [draft, setDraft] = useState<Date | null>(null)

  const hasSchedule = Boolean(value)

  const handleOpen = () => {
    setDraft(value ? new Date(value) : null)
    setPickerOpen(true)
  }

  const handleCancel = () => {
    setDraft(null)
    setPickerOpen(false)
  }

  const handleConfirm = () => {
    setValue(draft ? draft.toISOString() : null)
    setPickerOpen(false)
    setDraft(null)
  }

  const handleClear = () => {
    setValue(null)
    setDraft(null)
    setPickerOpen(false)
  }

  // Scheduled date is already set — show summary with edit/clear actions
  if (hasSchedule && !pickerOpen) {
    return (
      <div style={{ marginBottom: '8px' }}>
        <p
          style={{
            color: 'var(--theme-text-dim)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}
        >
          Scheduled For
        </p>
        <div
          style={{
            alignItems: 'center',
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-border)',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 10px',
          }}
        >
          <span style={{ color: 'var(--theme-text)', fontSize: '12px' }}>
            {formatDate(value!)}
          </span>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleOpen}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--theme-text-dim)',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '0',
              }}
              type="button"
            >
              Edit
            </button>
            <button
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--theme-error-500)',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '0',
              }}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Picker is open — show date picker with Confirm / Cancel
  if (pickerOpen) {
    return (
      <div style={{ marginBottom: '8px' }}>
        <p
          style={{
            color: 'var(--theme-text-dim)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}
        >
          Schedule For
        </p>
        <DatePicker
          onChange={(val) => setDraft(val instanceof Date ? val : null)}
          pickerAppearance="dayAndTime"
          value={draft ?? undefined}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            className="btn btn--style-secondary btn--size-small"
            disabled={!draft}
            onClick={handleConfirm}
            type="button"
          >
            Set Schedule
          </button>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--theme-text-dim)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 0',
            }}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Default — no schedule set, show button
  return (
    <div style={{ marginBottom: '8px' }}>
      <button
        className="btn btn--style-secondary btn--size-medium"
        onClick={handleOpen}
        style={{ width: '100%' }}
        type="button"
      >
        Schedule Post
      </button>
    </div>
  )
}
