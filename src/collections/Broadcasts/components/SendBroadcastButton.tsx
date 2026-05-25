'use client'

import { FormSubmit, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type BroadcastStatus = 'draft' | 'failed' | 'scheduled' | 'sent'
type SendPhase = 'idle' | 'confirming' | 'sending' | 'sent'

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

export const SendBroadcastButton: React.FC = () => {
  const { id, savedDocumentData } = useDocumentInfo()

  const status = (savedDocumentData?.sendStatus ?? 'draft') as BroadcastStatus
  const scheduledAt = savedDocumentData?.scheduledAt as string | null | undefined

  const [sendPhase, setSendPhase] = useState<SendPhase>('idle')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSent = status === 'sent' || sendPhase === 'sent'
  const isScheduled = status === 'scheduled'
  const isConfirming = sendPhase === 'confirming'
  const isSending = sendPhase === 'sending'
  const canSend = !isSent && !isScheduled && !cancelLoading && sendPhase === 'idle'

  if (!id) return null

  const handleSendClick = () => {
    if (!canSend) return
    setSendPhase('confirming')
  }

  const handleConfirmSend = async () => {
    setSendPhase('sending')
    setError(null)
    try {
      const res = await fetch(`/api/broadcasts/${id}/send`, { method: 'POST' })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (json.success) {
        setSendPhase('sent')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setSendPhase('idle')
        setError(json.error ?? 'Send failed — try again.')
      }
    } catch {
      setSendPhase('idle')
      setError('Request failed — check your network and try again.')
    }
  }

  const handleCancelConfirm = () => setSendPhase('idle')

  const handleCancelSchedule = async () => {
    if (
      !window.confirm(
        'Cancel this scheduled broadcast? It will be removed from Resend and reset to draft.',
      )
    )
      return
    setCancelLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/broadcasts/${id}/cancel`, { method: 'POST' })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (json.success) {
        window.location.reload()
      } else {
        setError(json.error ?? 'Cancel failed — try again.')
      }
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setCancelLoading(false)
    }
  }

  const buttonLabel = (() => {
    switch (true) {
      case isSent:
        return '✓ Broadcast Sent'
      case isConfirming:
        return 'Confirming...'
      case isSending:
        return 'Sending...'
      case isScheduled:
        return '⏱ Scheduled'
      case Boolean(scheduledAt):
        return 'Schedule Broadcast'
      default:
        return 'Send Broadcast'
    }
  })()

  const confirmModalBody = scheduledAt
    ? `Schedule this broadcast to send on ${formatDate(scheduledAt)}? You can cancel the schedule before it sends.`
    : 'Send this broadcast to all subscribers now? This cannot be undone.'

  return (
    <div style={{ position: 'relative' }}>
      {isConfirming && (
        <div
          style={{
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--theme-elevation-0)',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
              maxWidth: '420px',
              padding: '28px 28px 24px',
              width: '90%',
            }}
          >
            <p
              style={{
                color: 'var(--theme-text)',
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              {scheduledAt ? 'Schedule Broadcast' : 'Send Broadcast'}
            </p>
            <p
              style={{
                color: 'var(--theme-text-dim)',
                fontSize: '13px',
                lineHeight: 1.5,
                marginBottom: '24px',
              }}
            >
              {confirmModalBody}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn--style-secondary btn--size-medium"
                onClick={handleCancelConfirm}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn--style-primary btn--size-medium"
                onClick={handleConfirmSend}
                type="button"
              >
                {scheduledAt ? 'Confirm Schedule' : 'Confirm Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <FormSubmit
          buttonId="action-send-broadcast"
          buttonStyle="primary"
          disabled={!canSend && !isSent}
          onClick={canSend ? handleSendClick : undefined}
          size="medium"
          type="button"
        >
          {buttonLabel}
        </FormSubmit>
        {isScheduled && scheduledAt && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--theme-text-dim)', fontSize: '11px' }}>
              {formatDate(scheduledAt)}
            </span>
            <button
              className="btn btn--style-error btn--size-small"
              disabled={cancelLoading}
              onClick={handleCancelSchedule}
              style={{ fontSize: '11px' }}
              type="button"
            >
              {cancelLoading ? 'Cancelling...' : 'Cancel Schedule'}
            </button>
          </div>
        )}
      </div>
      {error && (
        <div
          style={{
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-error-500)',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'var(--theme-error-500)',
            fontSize: '12px',
            marginTop: '6px',
            padding: '8px 32px 8px 10px',
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '260px',
            zIndex: 10,
          }}
        >
          <button
            aria-label="Dismiss error"
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--theme-error-500)',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1,
              padding: '2px 4px',
              position: 'absolute',
              right: '4px',
              top: '4px',
            }}
            type="button"
          >
            ×
          </button>
          {error}
        </div>
      )}
    </div>
  )
}
