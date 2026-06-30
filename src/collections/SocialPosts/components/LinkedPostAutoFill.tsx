'use client'

import { useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isLinkCardPostType } from '../types'

type LinkedPostFieldValue = number | { id: number } | null

type PostAutoFillData = {
  id: number
  title: string
  socialPostBody?: string | null
  keywords?: (number | { id: number })[] | null
  slug?: string | null
}

type ResolvedMeta = {
  title?: string
  description?: string
  imageUrl?: string
}

/**
 * Auto-fills a Social Post from its source on the editor:
 *  - Linked Post (new docs): body, keywords, internal label title.
 *  - Link-card metadata (metaTitle/metaDescription/metaImageUrl): resolved via
 *    the single OG-scrape endpoint for BOTH internal Post URLs and external URLs.
 *    Meta is re-resolved only when the target URL changes, so manual overrides
 *    to the meta fields stick.
 *  - A "Re-fetch metadata" button force-refreshes the meta fields from the
 *    current URL (overwrites), so a stored degraded value can be corrected.
 */
const LinkedPostAutoFill: React.FC = () => {
  const { id: docId } = useDocumentInfo()
  const { dispatchFields } = useForm()
  const { value: linkedPostValue } = useField<LinkedPostFieldValue>({ path: 'linkedPost' })
  const { value: bodyValue } = useField<string | null>({ path: 'body' })
  const { value: keywordsValue } = useField<(number | { id: number })[] | null>({ path: 'keywords' })
  const { value: postType } = useField<string | null>({ path: 'postType' })
  const { value: urlValue } = useField<string | null>({ path: 'url' })

  const hasFetchedPostRef = useRef(false)
  const lastResolvedUrlRef = useRef<string | null>(null)
  const initializedRef = useRef(false)

  const [internalUrl, setInternalUrl] = useState<string | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)

  const linkedPostId =
    typeof linkedPostValue === 'object' && linkedPostValue !== null
      ? linkedPostValue.id
      : typeof linkedPostValue === 'number'
        ? linkedPostValue
        : null

  // Resolve link-card metadata from a URL and populate the meta fields.
  // Deduped on the URL unless `force` is set (the manual re-fetch button).
  const resolveMeta = useCallback(
    async (url: string, force = false) => {
      const trimmed = url.trim()
      if (!trimmed) return
      if (!force && lastResolvedUrlRef.current === trimmed) return
      lastResolvedUrlRef.current = trimmed

      try {
        const res = await fetch(`/api/social-posts/resolve-meta?url=${encodeURIComponent(trimmed)}`)
        if (!res.ok) return
        const meta = (await res.json()) as ResolvedMeta

        // Only overwrite with non-empty values — a failed/partial scrape never
        // wipes existing (possibly manually overridden) meta.
        if (meta.title) dispatchFields({ type: 'UPDATE', path: 'metaTitle', value: meta.title })
        if (meta.description)
          dispatchFields({ type: 'UPDATE', path: 'metaDescription', value: meta.description })
        if (meta.imageUrl)
          dispatchFields({ type: 'UPDATE', path: 'metaImageUrl', value: meta.imageUrl })
      } catch {
        // network/parse error — leave fields as-is
      }
    },
    [dispatchFields],
  )

  // Linked Post auto-fill (new documents only) + resolve meta from the post URL.
  useEffect(() => {
    if (!linkedPostId) {
      setInternalUrl(null)
      return
    }

    fetch(`/api/posts/${linkedPostId}?depth=1`)
      .then((r) => r.json() as Promise<PostAutoFillData>)
      .then((post) => {
        if (post.slug) setInternalUrl(`${window.location.origin}/posts/${post.slug}`)

        if (docId || hasFetchedPostRef.current) return
        hasFetchedPostRef.current = true

        if (post.socialPostBody && !bodyValue) {
          dispatchFields({ type: 'UPDATE', path: 'body', value: post.socialPostBody })
        }

        const keywords = post.keywords ?? []
        if (keywords.length > 0 && (!keywordsValue || (keywordsValue as unknown[]).length === 0)) {
          const ids = keywords.map((k) => (typeof k === 'object' ? k.id : k))
          dispatchFields({ type: 'UPDATE', path: 'keywords', value: ids })
        }

        dispatchFields({ type: 'UPDATE', path: 'title', value: post.title })

        if (post.slug) {
          void resolveMeta(`${window.location.origin}/posts/${post.slug}`)
        }
      })
      .catch(() => {})
  }, [linkedPostId, docId]) // eslint-disable-line react-hooks/exhaustive-deps

  // External URL meta resolution (debounced). Skips the first render so an
  // already-saved URL doesn't clobber stored meta on page load.
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      lastResolvedUrlRef.current = urlValue?.trim() ?? null
      return
    }

    if (!isLinkCardPostType(postType) || linkedPostId) return
    const url = urlValue?.trim()
    if (!url) return

    const timer = setTimeout(() => void resolveMeta(url), 600)
    return () => clearTimeout(timer)
  }, [urlValue, postType, linkedPostId, resolveMeta])

  // Target URL the re-fetch button operates on.
  const targetUrl = linkedPostId ? internalUrl : (urlValue?.trim() ?? null)

  if (!isLinkCardPostType(postType) || !targetUrl) return null

  const handleRefetch = async () => {
    setIsRefetching(true)
    try {
      await resolveMeta(targetUrl, true)
    } finally {
      setIsRefetching(false)
    }
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <button
        type="button"
        className="btn btn--style-secondary btn--size-small"
        onClick={handleRefetch}
        disabled={isRefetching}
      >
        {isRefetching ? 'Fetching…' : 'Re-fetch metadata'}
      </button>
    </div>
  )
}

export default LinkedPostAutoFill
