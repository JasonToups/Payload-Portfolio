'use client'

import { useField } from '@payloadcms/ui'
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type KeywordDoc = {
  id: string | number
  name: string
}

type KeywordsApiResponse = {
  docs: KeywordDoc[]
}

type KeywordCreateApiResponse = {
  doc: KeywordDoc
}

type KeywordsTagInputProps = {
  /** Form path of the keywords relationship field. Defaults to 'keywords'. */
  path?: string
  /** Helper text shown under the input. */
  helperText?: string
}

/**
 * Reusable tag-style input for a `keywords` (hasMany) relationship: type a word
 * and press `,`, `Tab`, or `Enter` to create-and-add it inline (with autocomplete
 * against existing keywords). Presentation-agnostic — wrap it in a SideBarSection
 * or a main-column field wrapper as needed.
 */
const KeywordsTagInput: React.FC<KeywordsTagInputProps> = ({
  path = 'keywords',
  helperText = 'Press , Tab, or Enter to add a keyword.',
}) => {
  const { value: fieldValue, setValue } = useField<(string | number)[]>({ path })

  const [inputText, setInputText] = useState('')
  const [suggestions, setSuggestions] = useState<KeywordDoc[]>([])
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [resolvedNames, setResolvedNames] = useState<Record<string | number, string>>({})
  const [isCreating, setIsCreating] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentIds = fieldValue ?? []

  // Resolve keyword names for display when existing IDs are loaded
  useEffect(() => {
    const missingIds = currentIds.filter((id) => !(id in resolvedNames))
    if (!missingIds.length) return

    void (async () => {
      try {
        const res = await fetch(
          `/api/keywords?where[id][in]=${missingIds.join(',')}&limit=50&depth=0`,
        )
        if (!res.ok) return
        const data = (await res.json()) as KeywordsApiResponse
        setResolvedNames((prev) => {
          const next = { ...prev }
          for (const kw of data.docs) next[kw.id] = kw.name
          return next
        })
      } catch {
        // non-critical — chips fall back to showing the raw ID
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldValue])

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = inputText.trim()
    if (!trimmed) {
      setSuggestions([])
      setHighlightIndex(0)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/keywords?where[name][like]=${encodeURIComponent(trimmed)}&limit=10&depth=0`,
        )
        if (!res.ok) return
        const data = (await res.json()) as KeywordsApiResponse
        setSuggestions(data.docs.filter((kw) => !currentIds.includes(kw.id)))
        setHighlightIndex(0)
      } catch {
        // non-critical
      }
    }, 150)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText])

  const addKeyword = (id: string | number, name: string) => {
    if (!currentIds.includes(id)) setValue([...currentIds, id])
    setResolvedNames((prev) => ({ ...prev, [id]: name }))
    setInputText('')
    setSuggestions([])
    setHighlightIndex(0)
  }

  const createOrFindKeyword = async (text: string): Promise<void> => {
    const trimmed = text.trim()
    if (!trimmed) return

    // Exact match already in suggestions — no API create needed
    const exact = suggestions.find((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    if (exact) {
      addKeyword(exact.id, exact.name)
      return
    }

    setIsCreating(true)
    try {
      const createRes = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })

      if (createRes.ok) {
        const data = (await createRes.json()) as KeywordCreateApiResponse
        addKeyword(data.doc.id, data.doc.name)
        return
      }

      // Creation failed (likely a duplicate) — look it up
      const findRes = await fetch(
        `/api/keywords?where[name][equals]=${encodeURIComponent(trimmed)}&limit=1&depth=0`,
      )
      if (findRes.ok) {
        const data = (await findRes.json()) as KeywordsApiResponse
        const found = data.docs[0]
        if (found) addKeyword(found.id, found.name)
      }
    } catch {
      // non-critical
    } finally {
      setIsCreating(false)
    }
  }

  const removeKeyword = (id: string | number) => {
    setValue(currentIds.filter((existing) => existing !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Tab':
        if (suggestions.length > 0) {
          e.preventDefault()
          addKeyword(suggestions[highlightIndex].id, suggestions[highlightIndex].name)
        } else if (inputText.trim()) {
          e.preventDefault()
          void createOrFindKeyword(inputText)
        }
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions.length > 0) {
          addKeyword(suggestions[highlightIndex].id, suggestions[highlightIndex].name)
        } else if (inputText.trim()) {
          void createOrFindKeyword(inputText)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => Math.max(i - 1, 0))
        break
      case ',':
        e.preventDefault()
        if (inputText.trim()) void createOrFindKeyword(inputText)
        break
      case 'Escape':
        setSuggestions([])
        setHighlightIndex(0)
        break
      case 'Backspace':
        if (!inputText && currentIds.length > 0) {
          removeKeyword(currentIds[currentIds.length - 1])
        }
        break
    }
  }

  return (
    <>
      {/* Chips + text input */}
      <label>Keywords</label>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          background: 'var(--theme-input-bg, var(--theme-elevation-100))',
          border: '1px solid var(--theme-border-color)',
          borderRadius: '4px',
          cursor: 'text',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          minHeight: '38px',
          padding: '4px 8px',
        }}
      >
        {currentIds.map((id) => (
          <span
            key={id}
            style={{
              alignItems: 'center',
              background: 'var(--theme-elevation-200)',
              borderRadius: '3px',
              color: 'var(--theme-text)',
              display: 'inline-flex',
              fontSize: '16px',
              gap: '4px',
              padding: '2px 6px',
            }}
          >
            {resolvedNames[id] ?? String(id)}
            <button
              aria-label={`Remove ${resolvedNames[id] ?? id}`}
              onClick={(e) => {
                e.stopPropagation()
                removeKeyword(id)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--theme-text-dim)',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1,
                padding: '0 2px',
              }}
              type="button"
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          disabled={isCreating}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          onChange={(e) => setInputText(e.target.value.toLowerCase())}
          onKeyDown={handleKeyDown}
          placeholder={currentIds.length === 0 ? 'Add a keyword…' : ''}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--theme-text)',
            flex: '1 1 80px',
            fontSize: '16px',
            minWidth: '80px',
            outline: 'none',
            padding: '2px 4px',
          }}
          type="text"
          value={inputText}
        />

        {inputText.trim() && !isCreating && (
          <button
            aria-label={`Add keyword "${inputText.trim()}"`}
            onMouseDown={(e) => {
              e.preventDefault()
              void createOrFindKeyword(inputText).then(() => inputRef.current?.focus())
            }}
            style={{
              alignSelf: 'center',
              background: 'none',
              border: 'none',
              color: 'var(--theme-text-dim)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
            }}
            type="button"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <ul
          style={{
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-border-color)',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            zIndex: 100,
          }}
        >
          {suggestions.map((kw, i) => (
            <li
              key={kw.id}
              onMouseDown={(e) => {
                // Prevent input blur before the keyword is added
                e.preventDefault()
                addKeyword(kw.id, kw.name)
              }}
              onMouseEnter={() => setHighlightIndex(i)}
              style={{
                background: i === highlightIndex ? 'var(--theme-elevation-100)' : 'transparent',
                color: 'var(--theme-text)',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '6px 12px',
              }}
            >
              {kw.name}
            </li>
          ))}
        </ul>
      )}
      <label style={{ color: 'var(--theme-text-dim)', fontSize: '16px', margin: '0 0 8px' }}>
        {helperText}
      </label>
    </>
  )
}

export default KeywordsTagInput
