'use client'

import type { PlatformEntry, PlatformPublishStatus, PlatformSlug } from '../types'
import { PLATFORM_LABELS } from '../types'

type PlatformsCellProps = {
  rowData?: { platforms?: PlatformEntry[] | null }
}

const STATUS_DOT_COLOR: Record<PlatformPublishStatus, string> = {
  draft:      'var(--theme-text-dim)',
  pending:    '#92400e',
  processing: '#1e40af',
  published:  'var(--theme-success-500)',
  failed:     'var(--theme-error-500)',
  cancelled:  'var(--theme-text-dim)',
}

const SHORT_LABELS: Record<PlatformSlug, string> = {
  linkedin: 'Li',
  twitter:  'X',
  bluesky:  'Sky',
  threads:  'Th',
  facebook: 'Fb',
}

export function PlatformsCell({ rowData }: PlatformsCellProps) {
  const platforms = (rowData?.platforms ?? []) as PlatformEntry[]
  const valid = platforms.filter((e) => Boolean(e.platform))

  if (valid.length === 0) {
    return <span style={{ color: 'var(--theme-text-dim)', fontSize: '16px', lineHeight: 1 }}>—</span>
  }

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
      {valid.map((entry) => (
        <span
          key={entry.platform}
          title={`${PLATFORM_LABELS[entry.platform]}: ${entry.status}`}
          style={{ alignItems: 'center', display: 'inline-flex', fontSize: '12px', gap: '3px' }}
        >
          <span
            style={{
              background: STATUS_DOT_COLOR[entry.status],
              borderRadius: '50%',
              display: 'inline-block',
              flexShrink: 0,
              height: '6px',
              width: '6px',
            }}
          />
          {SHORT_LABELS[entry.platform] ?? entry.platform}
        </span>
      ))}
    </span>
  )
}
