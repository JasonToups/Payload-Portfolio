'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'
import type { TextareaFieldClientProps } from 'payload'

const DEBOUNCE_MS = 800

const DebouncedSocialPostBody: React.FC<TextareaFieldClientProps> = ({ field, path, readOnly }) => {
  const { value, setValue } = useField<string>({ path })
  const [localValue, setLocalValue] = useState(value ?? '')
  const hasPendingChange = useRef(false)
  const mounted = useRef(false)

  // Sync from Payload when value changes externally (e.g. initial load, undo)
  useEffect(() => {
    if (!hasPendingChange.current) {
      setLocalValue(value ?? '')
    }
  }, [value])

  // Write back to Payload form state (and trigger autosave) only after typing stops
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    hasPendingChange.current = true
    const timer = setTimeout(() => {
      setValue(localValue)
      hasPendingChange.current = false
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [localValue, setValue])

  return (
    <div className="field-type textarea">
      <FieldLabel label={field.label} required={field.required} />
      <textarea
        className="textarea__input"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        disabled={readOnly}
        rows={4}
      />
    </div>
  )
}

export default DebouncedSocialPostBody
