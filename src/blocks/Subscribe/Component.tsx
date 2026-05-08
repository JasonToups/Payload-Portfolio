'use client'

import React, { useState } from 'react'
import { cn } from '@/utilities/ui'

interface SubscribeBlockProps {
  heading?: string
  description?: string
  placeholder?: string
  buttonText?: string
  source?: string
}

export const SubscribeBlock: React.FC<SubscribeBlockProps> = ({
  heading = 'Stay in the loop.',
  description = 'I write about what I build. No noise, no filler. Unsubscribe any time.',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
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
      className="section-primary bg-primary py-6 mb-6 md:mb-8 md:py-20 rounded-4xl"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl">
          {status === 'success' ? (
            <div className="text-center" role="status">
              <p
                className="font-display mb-2"
                style={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  fontWeight: 700,
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  color: 'var(--neutral-900)',
                }}
              >
                You&rsquo;re in.
              </p>
              <p className="text-body" style={{ color: 'var(--neutral-900)', opacity: 0.75 }}>
                Welcome — check your inbox for a confirmation.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2
                  style={{
                    fontFamily: 'var(--font-fraunces), Georgia, serif',
                    fontWeight: 800,
                    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                    lineHeight: 1.05,
                    color: 'var(--neutral-900)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {heading}
                </h2>
                <p
                  className="text-body"
                  style={{ color: 'var(--neutral-900)', opacity: 0.75, maxWidth: '42ch' }}
                >
                  {description}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                  <label htmlFor="subscribe-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="subscribe-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    required
                    autoComplete="email"
                    disabled={status === 'loading'}
                    className={cn(
                      'flex-1 rounded-[var(--radius)] px-4 py-3',
                      'text-body bg-background border border-border',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      'focus:ring-offset-[var(--primary-base)]',
                      'disabled:opacity-60',
                      'transition-shadow duration-150',
                    )}
                    aria-describedby={status === 'error' ? 'subscribe-error' : undefined}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className={cn(
                      'rounded-[var(--radius)] px-6 py-3',
                      'text-label bg-foreground text-background',
                      'hover:opacity-90 active:scale-[0.98]',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      'focus:ring-offset-[var(--primary-base)]',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all duration-150',
                      'whitespace-nowrap',
                      'min-w-[120px]',
                    )}
                    aria-live="polite"
                  >
                    {status === 'loading' ? (
                      <span aria-label="Submitting">Subscribing&hellip;</span>
                    ) : (
                      buttonText
                    )}
                  </button>
                </div>

                {status === 'error' && (
                  <p
                    id="subscribe-error"
                    role="alert"
                    className="mt-3 text-body"
                    style={{ color: 'var(--destructive)', fontSize: '1rem' }}
                  >
                    {errorMessage}
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
