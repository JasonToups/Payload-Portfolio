'use client'

import { useEffect, useState } from 'react'

type FacebookStatusResponse = { connected: boolean }

/**
 * Connection panel for Facebook on the Social Settings global: shows connection status and a
 * "Connect Facebook" button that runs the OAuth popup flow (mirrors the LinkedIn connect UI).
 */
export function FacebookConnect() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')

  const checkStatus = () => {
    fetch('/api/facebook/status')
      .then((r) => r.json())
      .then((data: FacebookStatusResponse) =>
        setStatus(data.connected ? 'connected' : 'disconnected'),
      )
      .catch(() => setStatus('disconnected'))
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const handleConnect = () => {
    const popup = window.open('/api/facebook/auth', 'facebook-oauth', 'width=600,height=700')
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data === 'facebook-connected') {
        setStatus('connected')
        window.removeEventListener('message', handleMessage)
        popup?.close()
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
        Facebook Connection
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
        {status !== 'connected' && status !== 'loading' && (
          <button
            className="btn btn--style-secondary btn--size-small"
            onClick={handleConnect}
            style={{ marginLeft: '8px' }}
            type="button"
          >
            Connect Facebook
          </button>
        )}
        {status === 'connected' && (
          <button
            className="btn btn--style-secondary btn--size-small"
            onClick={handleConnect}
            style={{ marginLeft: '8px' }}
            type="button"
          >
            Reconnect
          </button>
        )}
      </div>
    </div>
  )
}
