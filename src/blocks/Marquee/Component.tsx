'use client'
import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import type { MarqueeBlock as MarqueeBlockProps, Media as MediaType } from '@/payload-types'

const PIXELS_PER_SECOND = 80
const COPIES = 8

type TextItem = NonNullable<MarqueeBlockProps['items']>[number]
type LogoItem = NonNullable<MarqueeBlockProps['logos']>[number]

function TextTrack({ items }: { items: TextItem[] }) {
  const hasManualEmphasis = items.some(({ emphasis }) => emphasis)

  return (
    <>
      {items.map(({ label, emphasis, id }, i) => {
        const isEmphasised = hasManualEmphasis ? (emphasis ?? false) : i % 3 === 0
        return (
          <span
            key={id ?? i}
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
  return (
    <>
      {logos.map(({ image, alt, id }, i) => {
        if (typeof image !== 'object') return null
        const mediaImage = image as MediaType
        const altText = alt || mediaImage.alt || ''
        if (!mediaImage.url) return null
        const naturalWidth = mediaImage.width ?? 160
        const naturalHeight = mediaImage.height ?? 80
        return (
          <Image
            key={id ?? i}
            className="invert-0 dark:invert"
            src={mediaImage.url}
            alt={altText}
            width={naturalWidth}
            height={naturalHeight}
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

  const copyRef = useRef<HTMLDivElement>(null)
  const [copyWidth, setCopyWidth] = useState(0)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = copyRef.current
    if (!el) return
    const measure = () => setCopyWidth(el.offsetWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!hasItems && !hasLogos) return null

  const duration = copyWidth / PIXELS_PER_SECOND

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
        <motion.div
          style={{ display: 'flex', willChange: 'transform' }}
          animate={!prefersReduced && copyWidth > 0 ? { x: [0, -copyWidth] } : false}
          transition={{
            duration,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          {Array.from({ length: COPIES }, (_, i) => (
            <div
              key={i}
              ref={i === 0 ? copyRef : undefined}
              style={{ display: 'flex', gap: '4rem', paddingRight: '4rem', flexShrink: 0 }}
            >
              {hasItems && <TextTrack items={items!} />}
              {hasLogos && <ImageTrack logos={logos!} />}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
