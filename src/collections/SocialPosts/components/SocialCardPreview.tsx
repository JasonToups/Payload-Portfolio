'use client'

import { useField } from '@payloadcms/ui'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { isLinkCardPostType } from '../types'

type MediaDoc = {
  id?: string | number
  url?: string | null
  alt?: string | null
  updatedAt?: string | null
}

type ImageFieldValue = (MediaDoc | string | number)[] | null

const labelStyle: React.CSSProperties = {
  color: 'var(--theme-text-dim)',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  marginBottom: '10px',
  textTransform: 'uppercase',
}

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-border-color)',
  borderRadius: '14px',
  maxWidth: '380px',
  overflow: 'hidden',
}

const clamp = (lines: number): React.CSSProperties => ({
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: lines,
})

/**
 * Live social-card preview for the Social Posts editor. Reads ONLY the
 * normalized meta fields (metaTitle / metaDescription / metaImageUrl) for link
 * cards, so it renders identically regardless of whether the source was an
 * internal Post or an external URL. Switches presentation on postType:
 *   url        → link card
 *   linkedPost → link card
 *   image      → first image thumbnail
 *   content    → body-only text card
 */
export const SocialCardPreview: React.FC = () => {
  const { value: postType } = useField<string | null>({ path: 'postType' })
  const { value: metaTitle } = useField<string | null>({ path: 'metaTitle' })
  const { value: metaDescription } = useField<string | null>({ path: 'metaDescription' })
  const { value: metaImageUrl } = useField<string | null>({ path: 'metaImageUrl' })
  const { value: urlValue } = useField<string | null>({ path: 'url' })
  const { value: bodyValue } = useField<string | null>({ path: 'body' })
  const { value: imagesValue } = useField<ImageFieldValue>({ path: 'images' })

  const [firstImageUrl, setFirstImageUrl] = useState<string | null>(null)

  const type = postType ?? 'url'

  // Resolve the first image's URL for image posts (value may be an id or doc).
  useEffect(() => {
    if (type !== 'image' || !imagesValue || imagesValue.length === 0) {
      setFirstImageUrl(null)
      return
    }

    const first = imagesValue[0]
    if (typeof first === 'object' && first !== null && 'url' in first) {
      setFirstImageUrl(getMediaUrl(first.url, first.updatedAt) || null)
      return
    }

    const id = typeof first === 'string' || typeof first === 'number' ? first : null
    if (!id) return

    void fetch(`/api/media/${id}?depth=0`)
      .then((r) => r.json())
      .then((doc: MediaDoc) => setFirstImageUrl(getMediaUrl(doc.url, doc.updatedAt) || null))
      .catch(() => {})
  }, [type, imagesValue])

  let domain = ''
  if (isLinkCardPostType(type)) {
    try {
      domain = urlValue
        ? new URL(urlValue).hostname
        : typeof window !== 'undefined'
          ? window.location.hostname
          : ''
    } catch {
      domain = ''
    }
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={labelStyle}>Social Card Preview</p>

      {/* Link card */}
      {isLinkCardPostType(type) && (
        <div style={cardStyle}>
          <div
            style={{
              aspectRatio: '1.91 / 1',
              background: 'var(--theme-elevation-100)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {metaImageUrl ? (
              <Image
                alt={metaTitle || 'preview'}
                src={metaImageUrl}
                fill
                unoptimized
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <div
                style={{
                  alignItems: 'center',
                  color: 'var(--theme-text-dim)',
                  display: 'flex',
                  fontSize: '12px',
                  height: '100%',
                  justifyContent: 'center',
                }}
              >
                No card image — set a URL to scrape, or paste an image URL
              </div>
            )}
          </div>

          <div
            style={{
              background: 'var(--theme-elevation-50, var(--theme-elevation-100))',
              borderTop: '1px solid var(--theme-border-color)',
              padding: '10px 14px 12px',
            }}
          >
            {domain && (
              <p
                style={{
                  color: 'var(--theme-text-dim)',
                  fontSize: '11px',
                  letterSpacing: '0.02em',
                  marginBottom: '3px',
                  textTransform: 'uppercase',
                }}
              >
                {domain}
              </p>
            )}
            {metaTitle && (
              <p
                style={{
                  color: 'var(--theme-text)',
                  fontSize: '14px',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginBottom: metaDescription ? '3px' : 0,
                  ...clamp(2),
                }}
              >
                {metaTitle}
              </p>
            )}
            {metaDescription && (
              <p
                style={{
                  color: 'var(--theme-text-dim)',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  ...clamp(2),
                }}
              >
                {metaDescription}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Image post */}
      {type === 'image' && (
        <div style={cardStyle}>
          <div
            style={{
              aspectRatio: '1 / 1',
              background: 'var(--theme-elevation-100)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {firstImageUrl ? (
              <Image
                alt="preview"
                src={firstImageUrl}
                fill
                unoptimized
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <div
                style={{
                  alignItems: 'center',
                  color: 'var(--theme-text-dim)',
                  display: 'flex',
                  fontSize: '12px',
                  height: '100%',
                  justifyContent: 'center',
                }}
              >
                No image selected
              </div>
            )}
          </div>
          {imagesValue && imagesValue.length > 1 && (
            <div
              style={{
                background: 'var(--theme-elevation-50, var(--theme-elevation-100))',
                borderTop: '1px solid var(--theme-border-color)',
                color: 'var(--theme-text-dim)',
                fontSize: '11px',
                padding: '8px 14px',
              }}
            >
              Carousel · {imagesValue.length} images
            </div>
          )}
        </div>
      )}

      {/* Content-only post */}
      {type === 'content' && (
        <div style={{ ...cardStyle, padding: '12px 14px' }}>
          {bodyValue ? (
            <p
              style={{
                color: 'var(--theme-text)',
                fontSize: '13px',
                lineHeight: 1.45,
                ...clamp(5),
              }}
            >
              {bodyValue}
            </p>
          ) : (
            <p style={{ color: 'var(--theme-text-dim)', fontSize: '12px' }}>No content yet</p>
          )}
        </div>
      )}
    </div>
  )
}
