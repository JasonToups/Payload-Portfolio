import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'

type Testimonial = NonNullable<TestimonialsBlockProps['testimonials']>[number]

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  const isFeatured = t.featured ?? false

  return (
    <figure
      className="flex flex-col gap-6 pt-6"
      style={{
        borderTop: `2px solid ${isFeatured ? 'var(--primary-foreground)' : 'var(--primary-on-bg)'}`,
        background: isFeatured ? 'var(--primary)' : undefined,
        color: isFeatured ? 'var(--primary-foreground)' : undefined,
        borderRadius: isFeatured ? 'var(--radius)' : undefined,
        padding: isFeatured ? '1.5rem' : '1.5rem 0 0',
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: '3rem',
          lineHeight: 1,
          color: isFeatured ? 'var(--primary-foreground)' : 'var(--primary-on-bg)',
          opacity: isFeatured ? 0.6 : 0.4,
        }}
        aria-hidden="true"
      >
        &ldquo;
      </span>

      <blockquote
        className="font-display"
        style={{
          fontWeight: 500,
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          marginTop: '-1rem',
        }}
      >
        {t.quote}
      </blockquote>

      <figcaption style={{ marginTop: 'auto' }}>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{t.author}</div>
        {(t.role || t.company) && (
          <div
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              color: isFeatured ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              opacity: isFeatured ? 0.75 : 1,
              letterSpacing: '0.06em',
              marginTop: '0.25rem',
            }}
          >
            {[t.role, t.company].filter(Boolean).join(', ')}
          </div>
        )}
      </figcaption>
    </figure>
  )
}

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({
  eyebrow,
  heading,
  body,
  testimonials,
}) => {
  if (!testimonials?.length) return null

  return (
    <section className="py-12 md:py-24 px-6 md:px-12">
      <div
        className="grid gap-8 md:gap-16 mb-12 items-end"
        style={{ gridTemplateColumns: '1fr 2fr' }}
      >
        <div>
          {eyebrow && (
            <span
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--primary-on-bg)',
              }}
            >
              {eyebrow}
            </span>
          )}
          {heading && <h2 className="text-headline mt-4">{heading}</h2>}
        </div>

        {body && (
          <p
            className="text-body text-muted-foreground"
            style={{ fontSize: '1.0625rem', maxWidth: '52ch' }}
          >
            {body}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, index) => (
          <TestimonialCard key={t.id ?? index} t={t} index={index} />
        ))}
      </div>
    </section>
  )
}
