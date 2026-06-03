'use client'

import { useCallback, useEffect, useState } from 'react'
import { useField, useListDrawer } from '@payloadcms/ui'
import type { Data } from 'payload'
import type { Media } from '@/payload-types'

interface MediaThumb {
  id: number
  thumbnailURL: string | null
  filename: string | null
}

interface MediaListResponse {
  docs: Media[]
}

export function ImagesField() {
  const { value, setValue } = useField<(number | Media)[]>({ path: 'images' })
  const [thumbs, setThumbs] = useState<MediaThumb[]>([])

  const ids: number[] = (value ?? []).map((v) =>
    typeof v === 'object' ? (v as Media).id : (v as number),
  )

  useEffect(() => {
    if (ids.length === 0) {
      setThumbs([])
      return
    }
    const query = ids.map((id) => `where[id][in][]=${id}`).join('&')
    fetch(`/api/media?${query}&depth=0&limit=100`)
      .then((r) => r.json() as Promise<MediaListResponse>)
      .then(({ docs }) => {
        const byId = new Map(docs.map((d) => [d.id, d]))
        setThumbs(
          ids
            .map((id) => byId.get(id))
            .filter((d): d is Media => d !== undefined)
            .map((d) => ({
              id: d.id,
              thumbnailURL: d.thumbnailURL ?? null,
              filename: d.filename ?? null,
            })),
        )
      })
      .catch(() => {})
  }, [ids.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = useCallback(
    (id: number) => {
      setValue(ids.filter((i) => i !== id))
    },
    [ids, setValue],
  )

  const handleSelect = useCallback(
    ({ doc }: { collectionSlug: string; doc: Data; docID: string }) => {
      const selectedId = doc.id as number
      if (!ids.includes(selectedId)) {
        setValue([...ids, selectedId])
      }
    },
    [ids, setValue],
  )

  const [ListDrawer, , { openDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
  })

  return (
    <div style={{ marginBottom: '16px' }}>
      <p
        style={{
          color: 'var(--theme-text-dim)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}
      >
        Images
      </p>
      <p style={{ color: 'var(--theme-text-dim)', fontSize: '11px', marginBottom: '8px' }}>
        1 image = single image post. 2+ = carousel / multi-image post.
      </p>

      {thumbs.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          {thumbs.map((thumb) => (
            <div key={thumb.id} style={{ flexShrink: 0, position: 'relative' }}>
              {thumb.thumbnailURL ? (
                <img
                  alt={thumb.filename ?? `image ${thumb.id}`}
                  src={thumb.thumbnailURL}
                  style={{
                    border: '1px solid var(--theme-border)',
                    borderRadius: '4px',
                    display: 'block',
                    height: 72,
                    objectFit: 'cover',
                    width: 72,
                  }}
                />
              ) : (
                <div
                  style={{
                    alignItems: 'center',
                    background: 'var(--theme-elevation-100)',
                    border: '1px solid var(--theme-border)',
                    borderRadius: '4px',
                    color: 'var(--theme-text-dim)',
                    display: 'flex',
                    fontSize: '10px',
                    height: 72,
                    justifyContent: 'center',
                    overflow: 'hidden',
                    width: 72,
                  }}
                >
                  {thumb.filename ?? '?'}
                </div>
              )}
              <button
                aria-label={`Remove ${thumb.filename ?? 'image'}`}
                onClick={() => handleRemove(thumb.id)}
                style={{
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.65)',
                  border: 'none',
                  borderRadius: '50%',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  fontSize: '11px',
                  height: 18,
                  justifyContent: 'center',
                  lineHeight: 1,
                  padding: 0,
                  position: 'absolute',
                  right: 2,
                  top: 2,
                  width: 18,
                  zIndex: 1,
                }}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={openDrawer}
        style={{
          background: 'var(--theme-elevation-0)',
          border: '1px dashed var(--theme-border)',
          borderRadius: '4px',
          color: 'var(--theme-text-dim)',
          cursor: 'pointer',
          display: 'block',
          fontSize: '12px',
          padding: '6px 12px',
          width: '100%',
        }}
        type="button"
      >
        + Add Image
      </button>

      <ListDrawer onSelect={handleSelect} />
    </div>
  )
}
