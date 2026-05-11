import React from 'react'
import Image from 'next/image'
import type { MarqueeBlock as MarqueeBlockProps, Media as MediaType } from '@/payload-types'

type TextItem = NonNullable<MarqueeBlockProps['items']>[number]
type LogoItem = NonNullable<MarqueeBlockProps['logos']>[number]

const TEXT_REPEAT = 4
const LOGO_REPEAT = 4
const LOGO_HEIGHT_PX = 80
const GAP_PX = 64 // 4rem at 16px root
const PADDING_RIGHT_PX = 64
// ~2200px text track / 22s ≈ 100px/s — images match this rate
const MARQUEE_SPEED_PX_S = 100

function computeImageDuration(logos: LogoItem[]): string {
  const logoWidths = logos.map(({ image }) => {
    if (typeof image !== 'object') return 160
    const img = image as MediaType
    const h = img.height ?? LOGO_HEIGHT_PX
    const w = img.width ?? 160
    return w * (LOGO_HEIGHT_PX / h)
  })
  const totalLogoWidth = logoWidths.reduce((sum, w) => sum + w, 0)
  const itemCount = logos.length * LOGO_REPEAT
  const trackWidth = totalLogoWidth * LOGO_REPEAT + (itemCount - 1) * GAP_PX + PADDING_RIGHT_PX
  return `${Math.round(trackWidth / MARQUEE_SPEED_PX_S)}s`
}

function TextTrack({ items }: { items: TextItem[] }) {
  const hasManualEmphasis = items.some(({ emphasis }) => emphasis)
  const tiled = Array.from({ length: TEXT_REPEAT }, (_, rep) =>
    items.map((item, i) => ({ ...item, tileKey: `${rep}-${item.id ?? i}` })),
  ).flat()

  return (
    <>
      {tiled.map(({ label, emphasis, tileKey }, tiledIndex) => {
        const originalIndex = tiledIndex % items.length
        const isEmphasised = hasManualEmphasis ? (emphasis ?? false) : originalIndex % 3 === 0
        return (
          <span
            key={tileKey}
            className="font-display"
            style={{
              fontWeight: 500,
              fontSize: '2.5rem',
              color: isEmphasised ? 'var(--primary-on-bg)' : 'var(--foreground)',
              fontStyle: isEmphasised ? 'italic' : 'normal',
            }}
          >
            {label}
          </span>
        )
      })}
    </>
  )
}

function ImageTrack({ logos }: { logos: LogoItem[] }) {
  const tiled = Array.from({ length: LOGO_REPEAT }, (_, rep) =>
    logos.map(({ image, alt, id }, i) => ({ image, alt, key: `${rep}-${id ?? i}` })),
  ).flat()

  return (
    <>
      {tiled.map(({ image, alt, key }) => {
        if (typeof image !== 'object') return null
        const mediaImage = image as MediaType
        const altText = alt || mediaImage.alt || ''
        if (!mediaImage.url) return null
        const naturalWidth = mediaImage.width ?? 160
        const naturalHeight = mediaImage.height ?? 80
        return (
          <Image
            key={key}
            src={mediaImage.url}
            alt={altText}
            width={naturalWidth}
            height={naturalHeight}
            className="invert-0 dark:invert"
            style={{
              height: '80px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              flexShrink: 0,
            }}
          />
        )
      })}
    </>
  )
}

export const MarqueeBlock: React.FC<MarqueeBlockProps> = ({ eyebrow, variant, items, logos }) => {
  const isImages = variant === 'images'
  const hasItems = !isImages && Array.isArray(items) && items.length > 0
  const hasLogos = isImages && Array.isArray(logos) && logos.length > 0

  if (!hasItems && !hasLogos) return null

  // Text: scale the baseline 22s by the repeat factor to preserve visual speed.
  // Images: derive from actual logo dimensions at a shared px/s rate.
  const marqueeDuration = hasLogos ? computeImageDuration(logos!) : `${22 * TEXT_REPEAT}s`

  const trackStyle = { '--marquee-duration': marqueeDuration } as React.CSSProperties

  return (
    <section
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        paddingTop: eyebrow ? '1rem' : '1.5rem',
        paddingBottom: '1.5rem',
      }}
    >
      {eyebrow && (
        <div className="px-6 md:px-12 mb-4">
          <span
            className="font-mono"
            style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--primary-on-bg)' }}
          >
            {eyebrow}
          </span>
        </div>
      )}

      <div className="marquee" aria-hidden="true">
        {[0, 1].map((trackIndex) => (
          <div className="marquee-track" key={trackIndex} style={trackStyle}>
            {hasItems && <TextTrack items={items!} />}
            {hasLogos && <ImageTrack logos={logos!} />}
          </div>
        ))}
      </div>
    </section>
  )
}
