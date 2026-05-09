import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer, Media as MediaType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

const getFooterData = getCachedGlobal('footer', 1)

export async function Footer() {
  const footerData: Footer = await getFooterData()

  const navItems = footerData?.navItems || []
  const logoImage = footerData?.logo?.image as MediaType | undefined
  const logoText = footerData?.logo?.text
  const copyright = footerData?.copyright

  return (
    <footer
      className="mt-auto"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '2rem',
      }}
    >
      <div>
        <Link
          href="/"
          aria-label={logoText ? undefined : 'Go to homepage'}
          className="flex items-center gap-3 no-underline"
          style={{ color: 'var(--primary-on-bg)', marginBottom: '1rem' }}
        >
          {logoImage && typeof logoImage === 'object' ? (
            <div className="relative h-7 w-7">
              <Media
                resource={logoImage}
                imgClassName="object-contain invert dark:invert-0"
                fill
              />
            </div>
          ) : null}
          {logoText && (
            <span
              className="font-display"
              style={{ fontWeight: 700, fontSize: '1.125rem', color: 'inherit' }}
            >
              {logoText}
            </span>
          )}
        </Link>

        {copyright && (
          <p
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              letterSpacing: '0.08em',
            }}
          >
            {copyright}
          </p>
        )}
      </div>

      {navItems.length > 0 && (
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', fontSize: '0.875rem' }}>
          {navItems.map(({ link }, i) => (
            <CMSLink
              key={i}
              {...link}
              className="text-muted-foreground hover:text-foreground transition-colors"
            />
          ))}
        </nav>
      )}
    </footer>
  )
}
