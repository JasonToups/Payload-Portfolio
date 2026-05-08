import React from 'react'
import { cn } from '@/utilities/ui'
import { RevealOnScroll } from '@/components/RevealOnScroll'

interface ServiceItem {
  title: string
  description: string
}

interface ServicesBlockProps {
  heading?: string
  description?: string
  services?: ServiceItem[]
}

export const ServicesBlock: React.FC<ServicesBlockProps> = ({ heading, description, services }) => {
  if (!services?.length) return null

  return (
    <section className="section-warm md:py-20 py-6">
      <div className="container">
        <RevealOnScroll>
          <div className="mb-10 md:mb-16 max-w-2xl">
            {heading && <h2 className="text-headline mb-4">{heading}</h2>}
            {description && (
              <p
                className="text-foreground/75"
                style={{ fontSize: '1.0625rem', lineHeight: '1.7' }}
              >
                {description}
              </p>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll stagger>
          <dl className="divide-y divide-border">
            {services.map((service, index) => (
              <div
                key={index}
                className={cn(
                  'group grid grid-cols-1 gap-4 py-3 md:py-10 md:grid-cols-[1fr_2fr]',
                  'transition-colors duration-200 hover:bg-accent/40',
                  'px-4 -mx-4 rounded-[var(--radius)]',
                )}
              >
                <dt>
                  <span className="text-label text-primary font-semibold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-title mt-2 text-foreground group-hover:text-primary transition-colors duration-200">
                    {service.title}
                  </p>
                </dt>
                <dd>
                  <p
                    className="text-foreground/82 leading-relaxed"
                    style={{ fontSize: '1.0625rem', lineHeight: '1.7' }}
                  >
                    {service.description}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </div>
    </section>
  )
}
