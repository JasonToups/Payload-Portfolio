import { parse } from 'node-html-parser'

export type OpenGraphMeta = {
  title?: string
  description?: string
  imageUrl?: string
}

/**
 * Fetch a URL and extract its Open Graph / meta-tag card data.
 *
 * This is the single, source-agnostic procedure for resolving social-card
 * metadata — our own published Post URLs and external URLs go through the exact
 * same path, mirroring how the social networks themselves scrape link cards.
 *
 * Reads, in priority order:
 *   title:       og:title  → twitter:title  → <title>
 *   description: og:description → twitter:description → <meta name="description">
 *   image:       og:image  → twitter:image
 *
 * Relative image URLs are resolved against the page URL. Fails soft — on any
 * fetch/parse error it returns `{}` and never throws, so it can never block a
 * save or a preview.
 */
export async function fetchOpenGraph(url: string): Promise<OpenGraphMeta> {
  try {
    const res = await fetch(url, {
      headers: {
        // Some sites gate OG tags behind a real UA / Accept header.
        'User-Agent': 'Mozilla/5.0 (compatible; SocialCardBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })

    if (!res.ok) return {}

    const html = await res.text()
    const root = parse(html)

    const metaContent = (...selectors: string[]): string | undefined => {
      for (const selector of selectors) {
        const el = root.querySelector(selector)
        const content = el?.getAttribute('content')?.trim()
        if (content) return content
      }
      return undefined
    }

    const title =
      metaContent('meta[property="og:title"]', 'meta[name="twitter:title"]') ??
      root.querySelector('title')?.text?.trim() ??
      undefined

    const description = metaContent(
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    )

    const rawImage = metaContent('meta[property="og:image"]', 'meta[name="twitter:image"]')

    let imageUrl: string | undefined
    if (rawImage) {
      try {
        imageUrl = new URL(rawImage, url).href
      } catch {
        imageUrl = rawImage
      }
    }

    return { title, description, imageUrl }
  } catch {
    // Network failure, non-HTML response, parse error — return empty so callers
    // fall back to manual entry rather than failing.
    return {}
  }
}
