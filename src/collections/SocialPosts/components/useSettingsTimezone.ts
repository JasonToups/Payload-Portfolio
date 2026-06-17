'use client'

import { useEffect, useState } from 'react'

const FALLBACK_TIMEZONE = 'America/Chicago'

interface SocialSettingsResponse {
  timezone?: string | null
}

let cachedTimezone: string | null = null
let inFlight: Promise<string> | null = null

async function fetchSettingsTimezone(): Promise<string> {
  if (cachedTimezone) return cachedTimezone
  if (inFlight) return inFlight
  inFlight = fetch('/api/globals/social-settings?depth=0')
    .then((r) => (r.ok ? (r.json() as Promise<SocialSettingsResponse>) : null))
    .then((data) => {
      const tz = data?.timezone ?? FALLBACK_TIMEZONE
      cachedTimezone = tz
      return tz
    })
    .catch(() => FALLBACK_TIMEZONE)
    .finally(() => {
      inFlight = null
    })
  return inFlight
}

export function useSettingsTimezone(): string | null {
  const [timezone, setTimezone] = useState<string | null>(cachedTimezone)

  useEffect(() => {
    if (timezone) return
    let cancelled = false
    fetchSettingsTimezone().then((tz) => {
      if (!cancelled) setTimezone(tz)
    })
    return () => {
      cancelled = true
    }
  }, [timezone])

  return timezone
}

interface FormatOptions {
  iso: string
  settingsTimezone: string
}

interface FormattedDate {
  primary: string
  local: string | null
}

export function formatDateWithSettingsTimezone({ iso, settingsTimezone }: FormatOptions): FormattedDate {
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const baseOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }

  const date = new Date(iso)
  const primary = date.toLocaleString('en-US', { ...baseOptions, timeZone: settingsTimezone })

  if (!localTimezone || localTimezone === settingsTimezone) {
    return { primary, local: null }
  }

  const local = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: localTimezone,
  })

  return { primary, local }
}
