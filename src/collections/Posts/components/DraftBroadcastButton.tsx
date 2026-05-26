'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState, useEffect } from 'react'

import { SideBarSection, SideBarSubSection } from '@/components/ui/sidebarSections'
import { fetchBroadcastsForPost, type BroadcastSummary } from '../utils/fetchBroadcastsForPost'

type CreateBroadcastResponse = {
  doc?: { id: string }
  errors?: unknown[]
  message?: string
}

type EmailSettingsResponse = {
  broadcastAutomations?: {
    singlePostTemplate?: { id: string } | string | null
  } | null
}

/**
 * Sidebar UI field rendered on the Post edit screen.
 * Inactive (with hover tooltip) until the post is published.
 * On click, creates a new single_post Broadcast pre-filled with this post's
 * subject and relationship, then navigates to the new broadcast.
 */
const DraftBroadcastButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingBroadcasts, setExistingBroadcasts] = useState<BroadcastSummary[]>([])

  const { id, savedDocumentData } = useDocumentInfo()

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    fetchBroadcastsForPost(id, controller.signal)
      .then(setExistingBroadcasts)
      .catch(() => {})
    return () => controller.abort()
  }, [id])

  const isNewDoc = !id
  const isPublished = savedDocumentData?._status === 'published'
  const postTitle = (savedDocumentData?.title as string | undefined) ?? ''

  if (isNewDoc) return null

  const handleDraftBroadcast = async () => {
    if (!isPublished || !id) return

    setLoading(true)
    setError(null)

    try {
      // Read the configured Single Post template from Email Settings → Broadcast Automations
      const settingsRes = await fetch('/api/globals/email-settings?depth=1')
      const settingsJson = (await settingsRes.json()) as EmailSettingsResponse
      const singlePostTemplate = settingsJson.broadcastAutomations?.singlePostTemplate
      const templateId =
        typeof singlePostTemplate === 'object' && singlePostTemplate !== null
          ? singlePostTemplate.id
          : typeof singlePostTemplate === 'string'
            ? singlePostTemplate
            : null

      if (!templateId) {
        setError(
          'No Single Post template configured. Set one in Email Settings → Broadcast Automations.',
        )
        return
      }

      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateId, subject: postTitle, posts: [id] }),
      })

      const json = (await res.json()) as CreateBroadcastResponse

      if (!res.ok || !json.doc?.id) {
        setError('Failed to create broadcast — try again.')
        return
      }

      window.location.href = `/admin/collections/broadcasts/${json.doc.id}`
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SideBarSection
      title="Broadcast"
    >
      <div
        title={
          !isPublished
            ? 'Publish this post before drafting a broadcast'
            : 'Create a new draft broadcast for this post'
        }
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <button
          type="button"
          onClick={handleDraftBroadcast}
          disabled={!isPublished || loading}
          className="btn btn--style-primary btn--size-medium"
          style={{
            margin: '1rem 2rem 1rem 0',
            ...(!isPublished
              ? { opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }
              : {}),
          }}
        >
          {loading ? 'Creating…' : 'Draft Broadcast'}
        </button>
        {!isPublished && (
          <p style={{ fontSize: '12px', color: 'var(--theme-text-dim)' }}>
            Publish this post to enable
          </p>
        )}
      </div>

      {error && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--theme-error-500)' }}>
          {error}
        </p>
      )}

      {existingBroadcasts.length > 0 && (
        <SideBarSubSection title="Sent in:" style={{ marginTop: '12px' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {existingBroadcasts.map((b) => (
              <li key={b.id} style={{ marginBottom: '4px', textDecoration: 'underline' }}>
                <a
                  href={`/admin/collections/broadcasts/${b.id}`}
                  style={{
                    fontSize: '13px',
                    color: 'var(--theme-link-color)',
                    textDecoration: 'none',
                  }}
                >
                  {b.subject}
                  {b.sendStatus === 'sent' && (
                    <span style={{ marginLeft: '6px', color: 'var(--theme-success-500)' }}>✓</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </SideBarSubSection>
      )}
    </SideBarSection>
  )
}

export default DraftBroadcastButton
