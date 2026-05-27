'use client'

import { useField, useForm, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'
import type { SerializedEditorState } from 'lexical'

type TemplateFieldValue = number | { id: number } | null

type EmailTemplateResponse = {
  id: number
  templateType?: string | null
  body?: SerializedEditorState | null
}

const TemplateSelectorField: React.FC = () => {
  const { id: docId } = useDocumentInfo()
  const { value: templateValue } = useField<TemplateFieldValue>({ path: 'template' })
  const { dispatchFields } = useForm()
  const lastFetchedId = useRef<number | null>(null)

  const isNewDoc = !docId
  const templateId =
    typeof templateValue === 'object' && templateValue !== null
      ? templateValue.id
      : typeof templateValue === 'number'
        ? templateValue
        : null

  useEffect(() => {
    if (!templateId || templateId === lastFetchedId.current) return
    lastFetchedId.current = templateId

    fetch(`/api/email-templates/${templateId}?depth=0`)
      .then((r) => r.json() as Promise<EmailTemplateResponse>)
      .then((data) => {
        dispatchFields({ type: 'UPDATE', path: 'templateType', value: data.templateType ?? null })
        // Only pre-populate body on new broadcasts to avoid overwriting saved content
        if (isNewDoc && data.body != null) {
          dispatchFields({ type: 'UPDATE', path: 'body', value: data.body })
        }
      })
      .catch(() => {})
  }, [templateId, dispatchFields, isNewDoc])

  return null
}

export default TemplateSelectorField
