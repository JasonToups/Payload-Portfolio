'use client'

import { useField, useForm, useFormFields } from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'
import { composePlatformBody, type KeywordLike } from '@/lib/social/composePlatformBody'
import type { PlatformPublishStatus, PlatformSlug } from '../types'
import { PLATFORM_LABELS } from '../types'

interface PlatformRow {
  rowIndex: number
  platform: PlatformSlug
  status: PlatformPublishStatus
  body: string
}

type KeywordDoc = { id: string | number; name: string }
type KeywordsApiResponse = { docs: KeywordDoc[] }

/**
 * Editor for the per-platform body stored on each `platforms[]` entry. Renders one textarea
 * per selected platform, auto-copies an empty body from the base `body` + keywords using the
 * platform's hashtag rules, and offers a per-platform "Regenerate from base" action.
 * Published / processing entries are read-only (their text was already sent).
 */
export function PlatformBodiesField() {
  const { dispatchFields, setModified } = useForm()
  const { value: baseBody } = useField<string | null>({ path: 'body' })
  const { value: keywordsRaw } = useField<(string | number)[]>({ path: 'keywords' })

  const keywordIds = useMemo(() => keywordsRaw ?? [], [keywordsRaw])
  const [names, setNames] = useState<Record<string | number, string>>({})
  const [keywordsResolved, setKeywordsResolved] = useState(false)

  // Resolve keyword names (ordered) so composition can build hashtags.
  useEffect(() => {
    if (!keywordIds.length) {
      setKeywordsResolved(true)
      return
    }
    setKeywordsResolved(false)
    void (async () => {
      try {
        const res = await fetch(
          `/api/keywords?where[id][in]=${keywordIds.join(',')}&limit=100&depth=0`,
        )
        if (res.ok) {
          const data = (await res.json()) as KeywordsApiResponse
          setNames((prev) => {
            const next = { ...prev }
            for (const k of data.docs) next[k.id] = k.name
            return next
          })
        }
      } catch {
        // non-critical — compose without the unresolved names
      } finally {
        setKeywordsResolved(true)
      }
    })()
  }, [keywordIds])

  const orderedKeywords = useMemo<KeywordLike[]>(
    () => keywordIds.map((id) => names[id]).filter(Boolean).map((name) => ({ name })),
    [keywordIds, names],
  )

  // Read selected platform rows from indexed form state.
  const formStateJSON = useFormFields(([fields]) => {
    const count = typeof fields['platforms']?.value === 'number' ? (fields['platforms'].value as number) : 0
    const rows: PlatformRow[] = []
    for (let i = 0; i < count; i++) {
      const platform = fields[`platforms.${i}.platform`]?.value as PlatformSlug | undefined
      if (!platform) continue
      rows.push({
        rowIndex: i,
        platform,
        status: (fields[`platforms.${i}.status`]?.value as PlatformPublishStatus) ?? 'draft',
        body: (fields[`platforms.${i}.body`]?.value as string | null) ?? '',
      })
    }
    return JSON.stringify(rows)
  })

  const entries = useMemo<PlatformRow[]>(() => {
    try {
      return JSON.parse(formStateJSON) as PlatformRow[]
    } catch {
      return []
    }
  }, [formStateJSON])

  const isEditable = (status: PlatformPublishStatus) =>
    status !== 'published' && status !== 'processing'

  const setBody = (rowIndex: number, value: string) => {
    dispatchFields({ type: 'UPDATE', path: `platforms.${rowIndex}.body`, value })
    // Raw dispatchFields doesn't flip the form's `modified` flag; set it so Save activates.
    setModified(true)
  }

  // Copy-on-add: fill an empty body once keywords are resolved. Never overwrites a
  // non-empty (manually edited) body.
  useEffect(() => {
    if (!keywordsResolved) return
    for (const entry of entries) {
      if (!isEditable(entry.status) || entry.body) continue
      const composed = composePlatformBody(entry.platform, baseBody ?? '', orderedKeywords)
      if (composed) setBody(entry.rowIndex, composed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, keywordsResolved, baseBody, orderedKeywords])

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px' }}>Platform Bodies</label>

      {entries.length === 0 && (
        <p style={{ color: 'var(--theme-text-dim)', fontSize: '12px' }}>
          Add a platform (in the sidebar) to compose its body.
        </p>
      )}

      {entries.map((entry) => {
        const editable = isEditable(entry.status)
        return (
          <div
            key={entry.platform}
            style={{
              background: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-border)',
              borderRadius: '6px',
              marginBottom: '8px',
              padding: '10px 12px',
            }}
          >
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <span style={{ color: 'var(--theme-text)', fontSize: '13px', fontWeight: 600 }}>
                {PLATFORM_LABELS[entry.platform]}
              </span>
              {editable && (
                <button
                  onClick={() =>
                    setBody(
                      entry.rowIndex,
                      composePlatformBody(entry.platform, baseBody ?? '', orderedKeywords),
                    )
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--theme-text-dim)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    padding: '0',
                  }}
                  type="button"
                >
                  Regenerate from base
                </button>
              )}
            </div>
            <textarea
              onChange={(e) => setBody(entry.rowIndex, e.target.value)}
              readOnly={!editable}
              rows={4}
              style={{
                background: editable ? 'var(--theme-input-bg, var(--theme-elevation-100))' : 'var(--theme-elevation-100)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: '4px',
                color: 'var(--theme-text)',
                fontFamily: 'inherit',
                fontSize: '16px',
                padding: '8px',
                resize: 'vertical',
                width: '100%',
              }}
              value={entry.body}
            />
          </div>
        )
      })}
    </div>
  )
}
