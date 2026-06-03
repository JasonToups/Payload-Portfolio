'use client'

import { SaveButton, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { PlatformEntry, PlatformPublishStatus } from '../types'
import { PUBLISHABLE_STATUSES } from '../types'

type PublishResult =
  | { success: true; published?: string[]; failed?: string[]; queued?: string[]; message?: string }
  | { success: false; error: string; published?: string[]; failed?: string[]; queued?: string[] }

export function SocialPostSaveArea() {
  const { id, savedDocumentData } = useDocumentInfo()
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null)

  // Watch live form state to detect platforms array changes after publish.
  // useField({ path: 'platforms' }) returns a row count (number), not the array —
  // so we read individual indexed fields via useFormFields instead.
  const platformsSnapshot = useFormFields(([fields]) => {
    const count = typeof fields['platforms']?.value === 'number' ? (fields['platforms'].value as number) : 0
    const items: Array<{ platform: string; status: string }> = []
    for (let i = 0; i < count; i++) {
      const platform = fields[`platforms.${i}.platform`]?.value as string | undefined
      const status = (fields[`platforms.${i}.status`]?.value as string) ?? 'draft'
      if (platform) items.push({ platform, status })
    }
    return JSON.stringify(items)
  })

  // Snapshot of platforms at the moment of last publish — used to detect changes
  const publishSnapshotRef = useRef<string | null>(null)

  const savedPlatforms = (savedDocumentData?.platforms ?? []) as PlatformEntry[]
  const hasPublishable = savedPlatforms.some((p) => PUBLISHABLE_STATUSES.includes(p.status as PlatformPublishStatus))

  // After publishing, disable the button until the platforms array changes
  const [publishedOnce, setPublishedOnce] = useState(false)

  useEffect(() => {
    if (!publishedOnce) return
    if (platformsSnapshot !== publishSnapshotRef.current) {
      setPublishedOnce(false)
    }
  }, [platformsSnapshot, publishedOnce])

  const anyFailed = savedPlatforms.some((p) => p.status === 'failed')
  const buttonLabel = publishing
    ? 'Publishing…'
    : anyFailed && !savedPlatforms.some((p) => p.status === 'draft')
      ? 'Retry Failed'
      : 'Publish'

  const canPublish = !publishing && !publishedOnce && hasPublishable && Boolean(id)

  const handlePublish = async () => {
    if (!id) return
    setPublishing(true)
    setPublishResult(null)

    // Snapshot current form state so we can detect changes later
    publishSnapshotRef.current = platformsSnapshot

    try {
      const res = await fetch(`/api/social-posts/${id as number}/publish`, { method: 'POST' })
      const data = (await res.json()) as PublishResult
      setPublishResult(data)
      if (data.success) {
        setPublishedOnce(true)
      }
    } catch {
      setPublishResult({ success: false, error: 'Network error — check status in sidebar.' })
    } finally {
      setPublishing(false)
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {id && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            className="btn btn--style-secondary btn--size-medium"
          >
            {buttonLabel}
          </button>
        )}
        <SaveButton />
      </div>
      {publishResult && !publishResult.success && (
        <span style={{ color: 'var(--theme-error-500)', fontSize: '11px' }}>
          {publishResult.error}
        </span>
      )}
      {publishResult?.success && (publishResult.failed?.length ?? 0) > 0 && (
        <span style={{ color: 'var(--theme-warning-500, #92400e)', fontSize: '11px' }}>
          {publishResult.failed!.join(', ')} failed — see sidebar for details.
        </span>
      )}
    </div>
  )
}
