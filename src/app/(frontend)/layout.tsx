import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import localFont from 'next/font/local'
import React from 'react'

const spectral = localFont({
  src: [
    { path: '../../../public/fonts/spectral/spectral-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/spectral/spectral-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../../public/fonts/spectral/spectral-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/spectral/spectral-500-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../../public/fonts/spectral/spectral-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../public/fonts/spectral/spectral-600-italic.woff2', weight: '600', style: 'italic' },
    { path: '../../../public/fonts/spectral/spectral-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../../../public/fonts/spectral/spectral-700-italic.woff2', weight: '700', style: 'italic' },
    { path: '../../../public/fonts/spectral/spectral-800-normal.woff2', weight: '800', style: 'normal' },
    { path: '../../../public/fonts/spectral/spectral-800-italic.woff2', weight: '800', style: 'italic' },
  ],
  variable: '--font-spectral',
  display: 'swap',
})

const plusJakartaSans = localFont({
  src: [
    { path: '../../../public/fonts/plus-jakarta-sans/plus-jakarta-sans-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/plus-jakarta-sans/plus-jakarta-sans-700-normal.woff2', weight: '700', style: 'normal' },
  ],
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
import { getSocialSettings } from '@/utilities/getSocialSettings'
import { draftMode } from 'next/headers'

import { Analytics } from '@vercel/analytics/next'

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
        <Analytics />
      </body>
    </html>
  )
}

async function getTwitterCreator(): Promise<string | undefined> {
  const settings = await getSocialSettings()
  const profile = settings?.profiles?.find((p) => p.platform === 'twitter')
  if (!profile?.url) return undefined
  try {
    const handle = new URL(profile.url).pathname.split('/').filter(Boolean)[0]
    return handle ? `@${handle}` : undefined
  } catch {
    return undefined
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: await mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: await getTwitterCreator(),
  },
}
