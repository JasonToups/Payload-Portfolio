'use client'

import { useRowLabel } from '@payloadcms/ui'
import { PLATFORM_LABELS } from '@/collections/SocialPosts/types'

/**
 * Row label for the Social Profiles array — shows the selected platform's name (e.g. "LinkedIn")
 * so collapsed rows are identifiable, falling back to a generic label for a not-yet-set row.
 */
export function ProfileRowLabel() {
  const { data, rowNumber } = useRowLabel<{ platform?: string }>()
  const platform = data?.platform
  const label =
    platform && platform in PLATFORM_LABELS
      ? PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS]
      : `Profile ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`
  return <span>{label}</span>
}
