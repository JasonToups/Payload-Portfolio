import React from 'react'
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import { RevealOnScroll } from '@/components/RevealOnScroll'
import type { ServicesBlock as ServicesBlockProps } from '@/payload-types'
import RichText from '@/components/RichText'

type Tile = NonNullable<ServicesBlockProps['tiles']>[number]

// ── Tile sub-components ────────────────────────────────────────────────────────

function TileService({ tile }: { tile: Tile }) {
  const isWide = tile.size === 'span-4'

  return (
    <div
      className={cn(
        'bento-tile flex flex-col justify-between gap-2',
        isWide ? 'col-span-1 md:col-span-4' : 'col-span-1 md:col-span-2',
      )}
      style={{ minHeight: 280 }}
    >
      <div className="flex justify-between items-start">
        {tile.number && <span className="num">{tile.number}</span>}
      </div>

      <div>
        {tile.title && (
          <h3
            className={cn(
              'font-display font-semibold mb-4',
              isWide ? 'text-headline' : 'text-title',
            )}
            style={isWide ? { fontSize: '2.5rem' } : undefined}
          >
            {tile.title}
          </h3>
        )}
        {tile.description && (
          <RichText
            data={tile.description}
            enableGutter={false}
            className="text-muted-foreground"
            style={{ fontSize: '1.0625rem', maxWidth: '52ch' }}
          />
        )}
        {tile.tags && tile.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tile.tags.map(({ label, id }) => (
              <span key={id ?? label} className="tag">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TileCta({ tile }: { tile: Tile }) {
  const { cta } = tile
  if (!cta) return null

  return (
    <div
      className="bento-tile flex flex-col justify-between gap-2 col-span-1 md:col-span-2"
      style={{
        minHeight: 280,
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        borderColor: 'transparent',
      }}
    >
      <div className="flex flex-col justify-between items-start">
        {cta.eyebrow && (
          <span className="num" style={{ color: 'var(--primary-foreground)', opacity: 0.7 }}>
            {cta.eyebrow}
          </span>
        )}
        {cta.availability && (
          <span
            className="font-mono flex items-center gap-1.5"
            style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', opacity: 0.85 }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'currentColor',
                animation: 'mark-pulse 2s ease-in-out infinite',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {cta.availability}
          </span>
        )}
      </div>

      <div>
        {cta.heading && (
          <h3
            className="font-display font-semibold mb-3"
            style={{ fontSize: '1.875rem', lineHeight: 1.05, letterSpacing: '-0.015em' }}
          >
            {cta.heading}
          </h3>
        )}
        {cta.body && (
          <p
            style={{
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              opacity: 0.85,
              marginBottom: '1.5rem',
            }}
          >
            {cta.body}
          </p>
        )}
        {cta.buttonLabel && cta.buttonHref && (
          <Link
            href={cta.buttonHref}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium"
            style={{
              background: 'var(--neutral-900)',
              color: 'var(--neutral-50)',
              fontSize: '0.9375rem',
            }}
          >
            {cta.buttonLabel} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  )
}

function TileBuilding({ tile }: { tile: Tile }) {
  const { building } = tile
  if (!building) return null

  return (
    <div
      className="bento-tile flex flex-col justify-between gap-2 overflow-hidden col-span-1 md:col-span-2"
      style={{
        minHeight: 280,
        background: 'var(--neutral-900)',
        color: 'var(--neutral-100)',
        borderColor: 'var(--neutral-700)',
      }}
    >
      <div className="flex flex-col justify-between items-start">
        {building.eyebrow && (
          <span className="num" style={{ color: 'var(--primary)' }}>
            {building.eyebrow}
          </span>
        )}
        {building.liveLabel && (
          <span
            className="font-mono flex items-center gap-1.5"
            style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', color: 'var(--primary)' }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--primary)',
                boxShadow: '0 0 8px var(--primary)',
                animation: 'mark-pulse 1.6s ease-in-out infinite',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {building.liveLabel}
          </span>
        )}
      </div>

      <div>
        {building.heading && (
          <h3
            className="font-display font-semibold mb-4"
            style={{
              fontSize: '1.5rem',
              color: 'var(--neutral-50)',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            {building.heading}
          </h3>
        )}
        {building.checklist && building.checklist.length > 0 && (
          <ul
            className="flex flex-col gap-2"
            style={{ fontSize: '0.875rem', color: 'var(--neutral-350)' }}
          >
            {building.checklist.map(({ label, done, id }) => (
              <li
                key={id ?? label}
                className="flex items-center gap-2.5"
                style={{ color: done ? 'var(--neutral-100)' : undefined }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    color: done ? 'var(--primary)' : 'var(--neutral-450)',
                  }}
                  aria-hidden="true"
                >
                  {done ? '✓' : '○'}
                </span>
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Layout variants ────────────────────────────────────────────────────────────

function ServicesList({
  heading,
  description,
  services,
}: Pick<ServicesBlockProps, 'heading' | 'description' | 'services'>) {
  if (!services?.length) return null

  return (
    <section className="md:py-20 py-6">
      <div className="container">
        <RevealOnScroll>
          <div className="mb-10 md:mb-16 max-w-2xl">
            {heading && <h2 className="text-headline mb-4">{heading}</h2>}
            {description && (
              <RichText
                data={description}
                enableGutter={false}
                className="text-foreground/75"
                style={{ fontSize: '1.0625rem', lineHeight: '1.7' }}
              />
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
                  <RichText
                    data={service.description}
                    enableGutter={false}
                    className="text-foreground/82 leading-relaxed"
                    style={{ fontSize: '1.0625rem', lineHeight: '1.7' }}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </div>
    </section>
  )
}

function ServicesBento({
  heading,
  description,
  tiles,
}: Pick<ServicesBlockProps, 'heading' | 'description' | 'tiles'>) {
  if (!tiles?.length) return null

  return (
    <section className="py-12 md:py-24 px-6 md:px-12">
      <div className="grid grid-cols-2 gap-8 mb-12 items-end">
        <div>{heading && <h2 className="text-headline">{heading}</h2>}</div>
        {description && (
          <RichText
            data={description}
            enableGutter={false}
            className="text-body text-muted-foreground justify-self-end"
            style={{ fontSize: '1.0625rem', maxWidth: '48ch' }}
          />
        )}
      </div>

      <div className="bento grid md:grid-cols-6 grid-cols-1 gap-5">
        {tiles.map((tile) => {
          if (tile.kind === 'service') return <TileService key={tile.id} tile={tile} />
          if (tile.kind === 'cta') return <TileCta key={tile.id} tile={tile} />
          if (tile.kind === 'currentlyBuilding') return <TileBuilding key={tile.id} tile={tile} />
          return null
        })}
      </div>
    </section>
  )
}

// ── Public export ──────────────────────────────────────────────────────────────

export const ServicesBlock: React.FC<ServicesBlockProps> = (props) => {
  if (props.layout === 'bento') {
    return (
      <ServicesBento heading={props.heading} description={props.description} tiles={props.tiles} />
    )
  }
  return (
    <ServicesList
      heading={props.heading}
      description={props.description}
      services={props.services}
    />
  )
}
