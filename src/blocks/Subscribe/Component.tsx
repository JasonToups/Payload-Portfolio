'use client'

import React, { useState } from 'react'
import type { SubscribeBlock as SubscribeBlockProps } from '@/payload-types'
import { Button } from '@/components/ui/button'

export const SubscribeBlock: React.FC<SubscribeBlockProps> = ({
  eyebrow = '— Newsletter',
  heading = 'Field notes from the engineer / designer seam.',
  description = 'One letter a month on shipping, hiring, and the work that sits between teams. No spam, no ladder content.',
  placeholder = 'you@studio.com',
  buttonText = 'Subscribe →',
  meta = '827 READERS · MONTHLY · UNSUBSCRIBE WHENEVER',
  source = 'homepage',
}) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error || 'Something went wrong.')
      }

      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <section
      id="subscribe"
      className="px-6 md:px-12 py-24"
      style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          {eyebrow && (
            <span
              className="font-mono"
              style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--primary-on-bg)' }}
            >
              {eyebrow}
            </span>
          )}
          <h2 className="text-headline" style={{ marginTop: '1rem' }}>
            {heading}
          </h2>
        </div>

        <div>
          {status === 'success' ? (
            <div role="status">
              <p
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                }}
              >
                You&rsquo;re in.
              </p>
              <p className="text-body" style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                Welcome — check your inbox for a confirmation.
              </p>
            </div>
          ) : (
            <>
              {description && (
                <p
                  className="text-body"
                  style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', maxWidth: '36ch' }}
                >
                  {description}
                </p>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="flex gap-3" style={{ maxWidth: 480 }}>
                  <label htmlFor="subscribe-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="subscribe-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder ?? 'you@studio.com'}
                    required
                    autoComplete="email"
                    disabled={status === 'loading'}
                    aria-describedby={status === 'error' ? 'subscribe-error' : undefined}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      padding: '0.875rem 1rem',
                      color: 'var(--foreground)',
                      fontFamily: 'inherit',
                      fontSize: '0.9375rem',
                    }}
                  />
                  <Button
                    type="submit"
                    variant="large"
                    disabled={status === 'loading' || !email.trim()}
                    aria-live="polite"
                  >
                    {status === 'loading' ? (
                      <span aria-label="Submitting">Subscribing&hellip;</span>
                    ) : (
                      buttonText
                    )}
                  </Button>
                </div>

                {status === 'error' && (
                  <p
                    id="subscribe-error"
                    role="alert"
                    className="text-body"
                    style={{ color: 'var(--destructive)', marginTop: '0.75rem', fontSize: '1rem' }}
                  >
                    {errorMessage}
                  </p>
                )}
              </form>

              {meta && (
                <p
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    marginTop: '0.875rem',
                    color: 'var(--muted-foreground)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {meta}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
