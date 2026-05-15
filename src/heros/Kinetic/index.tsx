import React from 'react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

export const KineticHero: React.FC<Page['hero']> = ({
  eyebrow,
  version,
  headline,
  manifesto,
  links,
}) => {
  const rotatingWords = headline?.rotatingWords ?? []

  return (
    <section className="relative overflow-hidden px-12 pt-20 pb-12">
      <div
        className="blob blob-a"
        style={{ width: 520, height: 520, top: -160, left: '40%' }}
        aria-hidden="true"
      />

      <div className="relative">
        {(eyebrow || version) && (
          <div className="flex items-center gap-3 mb-12">
            {eyebrow && (
              <span
                className="font-mono text-muted-foreground"
                style={{ fontSize: '0.75rem', letterSpacing: '0.12em' }}
              >
                {eyebrow}
              </span>
            )}
            <span className="flex-1 h-px bg-border" aria-hidden="true" />
            {version && (
              <span
                className="font-mono text-muted-foreground"
                style={{ fontSize: '0.75rem', letterSpacing: '0.12em' }}
              >
                {version}
              </span>
            )}
          </div>
        )}

        <h1
          className="text-display"
          style={{ fontSize: 'clamp(3rem, 9vw, 8rem)', fontWeight: 700 }}
        >
          {(headline?.before || headline?.emphasis) && (
            <span className="block">
              {headline.before}&nbsp;
              {headline.emphasis && (
                <span
                  className="kinetic"
                  style={{ fontStyle: 'italic', color: 'var(--primary-on-bg)' }}
                >
                  {headline.emphasis}
                </span>
              )}
            </span>
          )}
          {(headline?.middle || rotatingWords.length > 0) && (
            <span className="block" style={{ paddingLeft: '6vw' }}>
              {headline?.middle}&nbsp;
              {rotatingWords.length > 0 && (
                <span className="word-swap">
                  {rotatingWords.map(({ word, id }) => (
                    <span key={id ?? word}>{word}</span>
                  ))}
                </span>
              )}
            </span>
          )}
        </h1>

        <div className="grid grid-cols-3 gap-8 mt-16 items-start">
          <div className="col-start-1 col-span-3">
            {manifesto && (
              <div style={{ fontSize: '1.0625rem', maxWidth: '38ch' }}>
                <RichText
                  data={manifesto}
                  enableGutter={false}
                  className="text-body text-muted-foreground"
                />
              </div>
            )}
          </div>

          <div aria-hidden="true" />
          <div className="row-start-2 col-start-2 md:col-start-3 col-span-2 md:col-span-1">
            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex flex-col gap-3">
                {links.map(({ link }, i) => (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
