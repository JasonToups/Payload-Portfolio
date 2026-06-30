import { parse } from 'node-html-parser'
import { fetchOEmbed, hasOEmbedProvider } from './fetchOEmbed'

export type OpenGraphMeta = {
  title?: string
  description?: string
  imageUrl?: string
}

// YouTube's generic boilerplate description, served on degraded/gated pages.
// We drop it so a gated page never stores junk as the card description.
const YOUTUBE_DEFAULT_DESCRIPTION =
  'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.'

const TITLE_SEPARATORS = ['|', '–', '—', '·', '-']

/**
 * A stored/derived title is "weak" when it carries no real content — empty, or
 * just a leading separator + site name (e.g. " - YouTube", "| LinkedIn") that
 * results when the page's real title was blank (a degraded/gated page).
 */
export function isWeakMetaTitle(title?: string | null): boolean {
  if (!title) return true
  const trimmed = title.trim()
  if (!trimmed) return true
  // Starts with a separator → the meaningful prefix was empty.
  return /^[-|–—·]\s*\S/.test(trimmed)
}

/**
 * Strip a trailing site-name suffix from a <title>. Uses og:site_name for a
 * precise match when available; otherwise removes a trailing
 * "<separator> <last segment>". Returns undefined if nothing meaningful remains.
 */
function cleanTitle(rawTitle: string, siteName?: string): string | undefined {
  let title = rawTitle.trim()
  if (!title) return undefined

  if (siteName) {
    for (const sep of TITLE_SEPARATORS) {
      const suffix = ` ${sep} ${siteName}`
      if (title.endsWith(suffix)) {
        title = title.slice(0, -suffix.length).trim()
        break
      }
      // Also handle the no-leading-space degraded form, e.g. "- YouTube".
      const tightSuffix = `${sep} ${siteName}`
      if (title.endsWith(tightSuffix) && title.length === tightSuffix.length) {
        title = ''
        break
      }
    }
  } else {
    // No site_name: strip a trailing " <sep> <last segment>".
    for (const sep of TITLE_SEPARATORS) {
      const idx = title.lastIndexOf(` ${sep} `)
      if (idx > 0) {
        title = title.slice(0, idx).trim()
        break
      }
    }
  }

  return title || undefined
}

/**
 * Fetch a URL and extract its Open Graph / meta-tag card data, with an oEmbed
 * fallback for known providers (e.g. YouTube) whose full pages get degraded
 * responses from datacenter IPs.
 *
 * Reads, in priority order:
 *   title:       og:title  → twitter:title  → cleaned <title>
 *   description: og:description → twitter:description → <meta name="description">
 *   image:       og:image  → twitter:image
 *
 * If the resulting title is weak or no image was found AND the URL matches an
 * oEmbed provider, oEmbed fills the missing title/image. Relative image URLs are
 * resolved against the page URL. Fails soft — returns `{}` and never throws.
 */
export async function fetchOpenGraph(url: string): Promise<OpenGraphMeta> {
  const meta = await scrapeOpenGraph(url)

  // Fall back to oEmbed for known providers when the scrape came back weak.
  if ((isWeakMetaTitle(meta.title) || !meta.imageUrl) && hasOEmbedProvider(url)) {
    const oembed = await fetchOEmbed(url)
    if (isWeakMetaTitle(meta.title) && oembed.title) meta.title = oembed.title
    if (!meta.imageUrl && oembed.imageUrl) meta.imageUrl = oembed.imageUrl
  }

  // Never store the weak placeholder title.
  if (isWeakMetaTitle(meta.title)) meta.title = undefined

  return meta
}

async function scrapeOpenGraph(url: string): Promise<OpenGraphMeta> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        // Bypass Google/YouTube's EU consent interstitial.
        Cookie: 'SOCS=CAI; CONSENT=YES+1',
      },
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!res.ok) return {}

    const html = await res.text()
    const root = parse(html)

    const metaContent = (...selectors: string[]): string | undefined => {
      for (const selector of selectors) {
        const content = root.querySelector(selector)?.getAttribute('content')?.trim()
        if (content) return content
      }
      return undefined
    }

    const siteName = metaContent('meta[property="og:site_name"]')

    const rawTitle = root.querySelector('title')?.text
    const title =
      metaContent('meta[property="og:title"]', 'meta[name="twitter:title"]') ??
      (rawTitle ? cleanTitle(rawTitle, siteName) : undefined)

    let description = metaContent(
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    )
    if (description === YOUTUBE_DEFAULT_DESCRIPTION) description = undefined

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
    return {}
  } finally {
    clearTimeout(timeout)
  }
}
