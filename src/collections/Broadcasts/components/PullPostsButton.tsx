'use client'

import { useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

type TemplateFieldValue = number | { id: number } | null

type TemplateAutoPull = {
  autoPullEnabled?: boolean | null
  categorySource?: number | { id: number } | null
  keywordSource?: number | { id: number } | null
  autoPullCount?: number | null
}

type EmailTemplateData = {
  templateType?: string | null
  autoPull?: TemplateAutoPull | null
}

type PullResult = { postIds: string[]; total: number }

/**
 * UI field rendered inside digest broadcast forms.
 * Calls the appropriate posts endpoint based on the template type and
 * pre-populates the `posts` relationship field.
 * Auto-fires on mount when a new template is selected; skips when loading
 * an existing broadcast that already has this template saved.
 */
const PullPostsButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [templateData, setTemplateData] = useState<EmailTemplateData | null>(null)

  const { dispatchFields, submit } = useForm()
  const { savedDocumentData } = useDocumentInfo()
  const { value: templateValue } = useField<TemplateFieldValue>({ path: 'template' })
  const { value: templateType } = useField<string | null>({ path: 'templateType' })

  const autoPulledRef = useRef(false)

  const resolvedTemplateId =
    typeof templateValue === 'object' && templateValue !== null
      ? templateValue.id
      : typeof templateValue === 'number'
        ? templateValue
        : null

  // Fetch template data when id changes — needed for categorySource/keywordSource/autoPullCount
  useEffect(() => {
    if (!resolvedTemplateId) {
      setTemplateData(null)
      return
    }
    fetch(`/api/email-templates/${resolvedTemplateId}?depth=1`)
      .then((r) => r.json() as Promise<EmailTemplateData>)
      .then(setTemplateData)
      .catch(() => {})
  }, [resolvedTemplateId])

  const buildFetchUrl = (data: EmailTemplateData): string | null => {
    const tType = data.templateType ?? templateType
    if (tType === 'weekly_digest') {
      return '/api/broadcasts/weekly-posts'
    }
    if (tType === 'category_digest') {
      const src = data.autoPull?.categorySource
      const catId = typeof src === 'object' && src !== null ? src.id : src
      const count = data.autoPull?.autoPullCount ?? 3
      return catId ? `/api/broadcasts/category-posts?categoryId=${catId}&limit=${count}` : null
    }
    if (tType === 'keyword_digest') {
      const src = data.autoPull?.keywordSource
      const kwId = typeof src === 'object' && src !== null ? src.id : src
      const count = data.autoPull?.autoPullCount ?? 3
      return kwId ? `/api/broadcasts/keyword-posts?keywordId=${kwId}&limit=${count}` : null
    }
    return null
  }

  const handlePull = async (data: EmailTemplateData = templateData ?? {}) => {
    const url = buildFetchUrl(data)
    if (!url) {
      setIsError(true)
      setMessage(
        'Cannot pull posts: missing category or keyword source on the selected template. Edit the template to configure it.',
      )
      return
    }

    setLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)

      const { postIds, total } = (await res.json()) as PullResult

      dispatchFields({ type: 'UPDATE', path: 'posts', value: postIds })

      setMessage(
        total === 0
          ? 'No published posts found.'
          : `Pulled ${postIds.length} post${postIds.length !== 1 ? 's' : ''} — review and remove any you don't want to include.`,
      )

      void submit({ skipValidation: true, disableFormWhileProcessing: false })
    } catch (err: unknown) {
      setIsError(true)
      setMessage(err instanceof Error ? err.message : 'Failed to pull posts — try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-pull when a new template is selected (not when loading a saved broadcast)
  useEffect(() => {
    if (!templateType || !templateData || autoPulledRef.current) return

    const savedTemplateValue = savedDocumentData?.template
    const savedTemplateId =
      typeof savedTemplateValue === 'object' && savedTemplateValue !== null
        ? (savedTemplateValue as { id: number }).id
        : typeof savedTemplateValue === 'number'
          ? savedTemplateValue
          : null

    const isNewTemplateSelection = savedTemplateId !== resolvedTemplateId
    if (!isNewTemplateSelection) return

    autoPulledRef.current = true

    const shouldAutoPull =
      templateType === 'weekly_digest' ||
      (templateType === 'category_digest' && templateData.autoPull?.categorySource) ||
      (templateType === 'keyword_digest' && templateData.autoPull?.keywordSource)

    if (shouldAutoPull) {
      void handlePull(templateData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType, templateData])

  // Reset auto-pull flag when template changes so re-selection triggers another pull
  useEffect(() => {
    autoPulledRef.current = false
  }, [resolvedTemplateId])

  const buttonLabel =
    templateType === 'category_digest'
      ? 'Pull Category Posts'
      : templateType === 'keyword_digest'
        ? 'Pull Keyword Posts'
        : "Pull This Week's Posts"

  return (
    <div style={{ marginTop: '4px', marginBottom: '4px' }}>
      <button
        type="button"
        onClick={() => void handlePull()}
        disabled={loading}
        className="btn btn--style-secondary btn--size-small"
      >
        {loading ? 'Pulling…' : buttonLabel}
      </button>

      {message && (
        <p
          style={{
            marginTop: '6px',
            fontSize: '13px',
            color: isError ? 'var(--theme-error-500)' : 'var(--theme-text)',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default PullPostsButton
