'use client'

import React, { useState } from 'react'
import { cn } from '@/utilities/ui'

interface SubscribePostBlockProps {
  description?: string | null
  placeholder?: string | null
  buttonText?: string | null
  meta?: string | null
  source?: string | null
  className?: string
}

export const SubscribePostBlock: React.FC<SubscribePostBlockProps> = ({
  description = 'Get updates in your inbox. No spam.',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  meta = 'UNSUBSCRIBE WHENEVER',
  source = 'post-sidebar',
  className,
}) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus('error')
      setErrorMessage('Please enter your email address.')
      return
    }
    if (!isValidEmail(email.trim())) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

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
      aria-label="Newsletter subscribe"
      className={cn('sticky-bottom bottom-0 flex flex-col h-fit py-[31px]', className)}
    >
      {status === 'success' ? (
        <div role="status">
          <p className="text-base font-medium text-foreground">You&rsquo;re in.</p>
          <p className="text-sm text-muted-foreground mt-1">Check your inbox for a confirmation.</p>
        </div>
      ) : (
        <>
          {description && (
            <p className="text-base text-muted-foreground font-plus-jakara-sans">{description}</p>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-4 flex flex-wrap justify-end w-full gap-2"
          >
            <label htmlFor="post-subscribe-email" className="sr-only">
              Email address
            </label>
            <input
              id="post-subscribe-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') {
                  setStatus('idle')
                  setErrorMessage('')
                }
              }}
              placeholder={placeholder ?? 'Enter your email'}
              required
              autoComplete="email"
              disabled={status === 'loading'}
              aria-describedby={status === 'error' ? 'post-subscribe-error' : undefined}
              className="flex-1 h-[40px] bg-neutral-50 border border-border rounded-[8px] px-4 text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              aria-live="polite"
              className="bg-primary-bright text-primary-dark rounded-[10px] px-4 py-[10px] min-h-[44px] min-w-[119px] font-medium text-base leading-none disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {status === 'loading' ? (
                <span aria-label="Submitting">Subscribing&hellip;</span>
              ) : (
                buttonText
              )}
            </button>
          </form>

          {status === 'error' && (
            <p id="post-subscribe-error" role="alert" className="text-sm text-destructive mt-2">
              {errorMessage}
            </p>
          )}

          {meta && (
            <p className="font-mono text-[12px] text-muted-foreground tracking-[0.96px] text-right mt-3">
              {meta}
            </p>
          )}
        </>
      )}
    </section>
  )
}
