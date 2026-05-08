import React from 'react'
import { RevealOnScroll } from '@/components/RevealOnScroll'

interface Testimonial {
  quote: string
  author: string
  role?: string
  company?: string
}

interface TestimonialsBlockProps {
  heading?: string
  testimonials?: Testimonial[]
}

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({ heading, testimonials }) => {
  if (!testimonials?.length) return null

  return (
    <section className="section-warm md:py-24 py-12">
      <div className="container">
        {heading && (
          <RevealOnScroll>
            <h2 className="text-headline mb-16">{heading}</h2>
          </RevealOnScroll>
        )}

        <RevealOnScroll stagger>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, index) => (
              <figure key={index} className="flex flex-col gap-6">
                <blockquote>
                  <p
                    className="font-display leading-snug"
                    style={{
                      fontFamily: 'var(--font-fraunces), Georgia, serif',
                      fontWeight: 700,
                      fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
                      lineHeight: 1.25,
                      color: 'var(--foreground)',
                    }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption
                  className="flex flex-col gap-0.5 pt-4"
                  style={{ borderTop: '1px solid var(--primary-light)' }}
                >
                  <span className="text-body font-semibold" style={{ fontSize: '1rem' }}>
                    {t.author}
                  </span>
                  {(t.role || t.company) && (
                    <span className="text-body text-muted-foreground" style={{ fontSize: '1rem' }}>
                      {[t.role, t.company].filter(Boolean).join(', ')}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
