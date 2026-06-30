'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import Link from 'next/link'

export function ScheduleSocialPostNavButton() {
  const { id } = useDocumentInfo()
  if (!id) return null

  return (
    <div style={{ marginBottom: '16px' }}>
      <p
        style={{
          color: 'var(--theme-text-dim)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '12px',
          textTransform: 'uppercase',
        }}
      >
        Schedule Social Media Post
      </p>
      <Link
        href={`/admin/collections/social-posts/create?linkedPost=${id}&postType=linkedPost`}
        className="btn btn--style-secondary btn--size-medium"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        📅 Schedule a Post
      </Link>
    </div>
  )
}
