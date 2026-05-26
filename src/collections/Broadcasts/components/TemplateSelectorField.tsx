'use client'

import { useField, useForm } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

type TemplateFieldValue = number | { id: number } | null

type EmailTemplateResponse = {
  id: number
  templateType?: string | null
}

/**
 * Invisible UI field component placed after the `template` relationship field.
 * When the template selection changes, fetches the template and syncs its
 * `templateType` value into the hidden `templateType` form field. This lets
 * all other field conditions (posts, pullPostsButton) read a stable string
 * value rather than resolving the relationship themselves.
 */
const TemplateSelectorField: React.FC = () => {
  const { value: templateValue } = useField<TemplateFieldValue>({ path: 'template' })
  const { dispatchFields } = useForm()
  const lastFetchedId = useRef<number | null>(null)

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
      })
      .catch(() => {})
  }, [templateId, dispatchFields])

  return null
}

export default TemplateSelectorField
