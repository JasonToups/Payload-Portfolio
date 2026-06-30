export type OEmbedMeta = {
  title?: string
  imageUrl?: string
}

type OEmbedProvider = {
  /** Returns true when this provider can resolve the given URL. */
  matches: (u: URL) => boolean
  /** Builds the provider's oEmbed endpoint for the given page URL. */
  endpoint: (pageUrl: string) => string
}

type OEmbedResponse = {
  title?: string
  thumbnail_url?: string
}

const isYouTube = (u: URL): boolean => {
  const host = u.hostname.replace(/^www\./, '')
  return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be'
}

/**
 * Known oEmbed providers. oEmbed is a lightweight public JSON API that — unlike
 * the full HTML page — is not gated by datacenter IP / consent, so it reliably
 * returns a title + thumbnail where a raw scrape gets a degraded page (e.g.
 * YouTube from Vercel functions). Add new providers as one-liners here.
 */
const PROVIDERS: OEmbedProvider[] = [
  {
    matches: isYouTube,
    endpoint: (pageUrl) =>
      `https://www.youtube.com/oembed?url=${encodeURIComponent(pageUrl)}&format=json`,
  },
]

/**
 * Resolve `{ title, imageUrl }` via a provider's oEmbed endpoint, if the URL
 * matches a known provider. Returns `{}` when no provider matches or on any
 * error (fails soft). oEmbed does not return a description.
 */
export async function fetchOEmbed(url: string): Promise<OEmbedMeta> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return {}
  }

  const provider = PROVIDERS.find((p) => p.matches(parsed))
  if (!provider) return {}

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(provider.endpoint(url), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!res.ok) return {}

    const data = (await res.json()) as OEmbedResponse
    return {
      title: data.title?.trim() || undefined,
      imageUrl: data.thumbnail_url?.trim() || undefined,
    }
  } catch {
    return {}
  } finally {
    clearTimeout(timeout)
  }
}

/** True when the URL belongs to a provider we have an oEmbed endpoint for. */
export function hasOEmbedProvider(url: string): boolean {
  try {
    return PROVIDERS.some((p) => p.matches(new URL(url)))
  } catch {
    return false
  }
}
