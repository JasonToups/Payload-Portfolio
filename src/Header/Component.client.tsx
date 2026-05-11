'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Media as MediaType } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { Media } from '@/components/Media'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const logoImage = data.logo?.image as MediaType | undefined
  const logoText = data.logo?.text

  return (
    <header
      className="absolute z-20 w-full flex justify-center"
      style={{ height: '60px' }}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container flex justify-between w-full max-w-xl bg-background border-4 border-neutral-150 rounded-full py-3 px-4 md:py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          {logoImage && typeof logoImage === 'object' && (
            <div className="relative h-[34px] w-[34px]">
              <Media
                resource={logoImage}
                imgClassName="object-contain invert-0 dark:invert"
                fill
                priority
              />
            </div>
          )}
          {logoText && <span className="text-xl font-semibold text-primary-on-bg">{logoText}</span>}
          {!logoImage && !logoText && (
            <Logo loading="eager" priority="high" className="invert dark:invert-0" />
          )}
        </Link>

        <HeaderNav data={data} />
      </div>
    </header>
  )
}
