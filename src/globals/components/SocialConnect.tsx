'use client'

import { useEffect, useState } from 'react'

type StatusResponse = { connected: boolean }

/**
 * Reusable connection panel for an OAuth social platform on the Social Settings global.
 * Shows connection status and a Connect/Reconnect button that runs the OAuth popup flow
 * (`/api/{platform}/auth`), then reloads so Payload re-fetches the newly-saved token fields.
 * All account connections live here — not in the Posts editor.
 */
export function SocialConnect({ platform, label }: { platform: string; label: string }) {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')

  const checkStatus = () => {
    fetch(`/api/${platform}/status`)
      .then((r) => r.json())
      .then((data: StatusResponse) => setStatus(data.connected ? 'connected' : 'disconnected'))
      .catch(() => setStatus('disconnected'))
  }

  useEffect(() => {
    checkStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConnect = () => {
    const popup = window.open(`/api/${platform}/auth`, `${platform}-oauth`, 'width=600,height=700')
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data === `${platform}-connected`) {
        window.removeEventListener('message', handleMessage)
        popup?.close()
        // Reload so Payload re-fetches the global and the newly-saved token fields populate.
        window.location.reload()
      }
    }
    window.addEventListener('message', handleMessage)
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
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          color: 'var(--theme-text-dim)',
          display: 'block',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}
      >
        {label} Connection
      </label>
      <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
        <span
          style={{
            background: statusColor,
            borderRadius: '50%',
            display: 'inline-block',
            flexShrink: 0,
            height: '8px',
            width: '8px',
          }}
        />
        <span style={{ color: 'var(--theme-text-dim)', fontSize: '13px' }}>{statusLabel}</span>
        {status !== 'loading' && (
          <button
            className="btn btn--style-secondary btn--size-small"
            onClick={handleConnect}
            style={{ marginLeft: '8px' }}
            type="button"
          >
            {status === 'connected' ? 'Reconnect' : `Connect ${label}`}
          </button>
        )}
      </div>
    </div>
  )
}

export function LinkedInConnect() {
  return <SocialConnect platform="linkedin" label="LinkedIn" />
}

export function ThreadsConnect() {
  return <SocialConnect platform="threads" label="Threads" />
}

export function TwitterConnect() {
  return <SocialConnect platform="twitter" label="Twitter / X" />
}

export function FacebookConnect() {
  return <SocialConnect platform="facebook" label="Facebook" />
}
