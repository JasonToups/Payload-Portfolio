import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Spectral, Plus_Jakarta_Sans } from 'next/font/google'
import React from 'react'

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-spectral',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'optional',
})

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getSiteSettings } from '@/utilities/getSiteSettings'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  let faviconUrl = '/favicon.ico'

  try {
    const settings = await getSiteSettings()
    if (settings?.favicon && typeof settings.favicon === 'object' && 'url' in settings.favicon) {
      // Handle potential null/undefined url from Media type
      const url = settings.favicon.url
      if (typeof url === 'string') {
        faviconUrl = url
      }
    }
  } catch {
    // Use default if site settings not available
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable, spectral.variable, plusJakartaSans.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href={faviconUrl} rel="icon" sizes="32x32" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: await mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
