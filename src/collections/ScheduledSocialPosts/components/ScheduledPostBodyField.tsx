'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import type { TextareaFieldClientProps } from 'payload'
import { useEffect, useRef } from 'react'

type PostFieldValue = number | { id: number; socialPostBody?: string | null } | null

export const ScheduledPostBodyField: React.FC<TextareaFieldClientProps> = ({
  field,
  path,
  readOnly,
}) => {
  const { value: body, setValue: setBody } = useField<string>({ path: path ?? 'body' })
  const { value: post } = useField<PostFieldValue>({ path: 'post' })
  const lastFetchedPostId = useRef<number | null>(null)

  const postId =
    typeof post === 'object' && post !== null
      ? post.id
      : typeof post === 'number'
        ? post
        : null

  useEffect(() => {
    if (!postId || postId === lastFetchedPostId.current) return
    if (body) return
    lastFetchedPostId.current = postId
    fetch(`/api/posts/${postId}?depth=0`)
      .then((r) => r.json() as Promise<{ socialPostBody?: string | null }>)
      .then((data) => {
        if (data.socialPostBody) setBody(data.socialPostBody)
      })
      .catch(() => {})
  }, [postId, body, setBody])

  return (
    <div className="field-type textarea">
      <FieldLabel label={field.label as string} required={field.required} />
      <textarea
        className="textarea__input"
        disabled={readOnly}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        value={body ?? ''}
      />
    </div>
  )
}
