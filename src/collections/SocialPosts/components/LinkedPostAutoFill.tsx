'use client'

import { useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

type LinkedPostFieldValue = number | { id: number } | null

type PostAutoFillData = {
  id: number
  title: string
  socialPostBody?: string | null
  keywords?: (number | { id: number })[] | null
  slug?: string | null
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
  bluesky: 'BlueSky',
  threads: 'Threads',
}

const LinkedPostAutoFill: React.FC = () => {
  const { id: docId } = useDocumentInfo()
  const { dispatchFields } = useForm()
  const { value: linkedPostValue } = useField<LinkedPostFieldValue>({ path: 'linkedPost' })
  const { value: platform } = useField<string | null>({ path: 'platform' })
  const { value: bodyValue } = useField<string | null>({ path: 'body' })
  const { value: keywordsValue } = useField<(number | { id: number })[] | null>({ path: 'keywords' })

  const postDataRef = useRef<PostAutoFillData | null>(null)
  const hasFetchedRef = useRef(false)

  const linkedPostId =
    typeof linkedPostValue === 'object' && linkedPostValue !== null
      ? linkedPostValue.id
      : typeof linkedPostValue === 'number'
        ? linkedPostValue
        : null

  // Auto-fill body and keywords when linkedPost is set on a new document
  useEffect(() => {
    if (docId || !linkedPostId || hasFetchedRef.current) return
    hasFetchedRef.current = true

    fetch(`/api/posts/${linkedPostId}?depth=1`)
      .then((r) => r.json() as Promise<PostAutoFillData>)
      .then((post) => {
        postDataRef.current = post

        if (post.socialPostBody && !bodyValue) {
          dispatchFields({ type: 'UPDATE', path: 'body', value: post.socialPostBody })
        }

        const keywords = post.keywords ?? []
        if (keywords.length > 0 && (!keywordsValue || (keywordsValue as unknown[]).length === 0)) {
          const ids = keywords.map((k) => (typeof k === 'object' ? k.id : k))
          dispatchFields({ type: 'UPDATE', path: 'keywords', value: ids })
        }

        // Set title if platform is already selected
        if (platform) {
          const label = PLATFORM_LABELS[platform] ?? platform
          dispatchFields({ type: 'UPDATE', path: 'title', value: `${label} — ${post.title}` })
        }
      })
      .catch(() => {})
  }, [linkedPostId, docId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update title whenever platform changes on a new document with a linked post
  useEffect(() => {
    if (docId || !linkedPostId || !platform) return

    const setTitle = (post: PostAutoFillData) => {
      const label = PLATFORM_LABELS[platform] ?? platform
      dispatchFields({ type: 'UPDATE', path: 'title', value: `${label} — ${post.title}` })
    }

    if (postDataRef.current) {
      setTitle(postDataRef.current)
    } else {
      fetch(`/api/posts/${linkedPostId}?depth=0`)
        .then((r) => r.json() as Promise<PostAutoFillData>)
        .then((post) => {
          postDataRef.current = post
          setTitle(post)
        })
        .catch(() => {})
    }
  }, [platform, linkedPostId, docId]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export default LinkedPostAutoFill
