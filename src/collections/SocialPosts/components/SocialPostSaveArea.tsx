'use client'

import { SaveButton, useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type PublishResponse =
  | { success: true; publishedUrl?: string; message?: string }
  | { success: false; error: string }

export function SocialPostSaveArea() {
  const { id, savedDocumentData } = useDocumentInfo()
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)

  const status = (savedDocumentData?.status ?? 'draft') as string
  const canPublish = ['draft', 'failed', 'cancelled'].includes(status)

  const handlePublish = async () => {
    if (!id) return
    setPublishing(true)
    try {
      await fetch(`/api/social-posts/${id as number}/publish`, { method: 'POST' })
    } catch {
      // sidebar Status / Error Message fields reflect the outcome after refresh
    } finally {
      setPublishing(false)
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {id && (
        <button
          type="button"
          onClick={handlePublish}
          disabled={publishing || !canPublish}
          className="btn btn--style-secondary btn--size-medium"
        >
          {publishing ? 'Publishing…' : 'Publish'}
        </button>
      )}
      <SaveButton />
    </div>
  )
}
