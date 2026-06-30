import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchOpenGraph, isWeakMetaTitle } from '@/utilities/fetchOpenGraph'

type MockRoute = { html?: string; json?: unknown; ok?: boolean; status?: number }

// URL-aware fetch mock: route by substring match so the page scrape and the
// oEmbed call can return different payloads.
const mockFetch = (routes: Record<string, MockRoute>) =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input)
    const key = Object.keys(routes).find((k) => url.includes(k))
    const route = key ? routes[key] : undefined
    if (!route) return { ok: false, status: 404, text: async () => '' } as Response
    return {
      ok: route.ok ?? true,
      status: route.status ?? 200,
      text: async () => route.html ?? '',
      json: async () => route.json,
    } as Response
  })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isWeakMetaTitle', () => {
  it('flags empty and separator-led titles as weak', () => {
    expect(isWeakMetaTitle(undefined)).toBe(true)
    expect(isWeakMetaTitle('')).toBe(true)
    expect(isWeakMetaTitle('   ')).toBe(true)
    expect(isWeakMetaTitle(' - YouTube')).toBe(true)
    expect(isWeakMetaTitle('| LinkedIn')).toBe(true)
  })

  it('treats real titles as strong', () => {
    expect(isWeakMetaTitle('Mary Lou Pearl performs')).toBe(false)
    expect(isWeakMetaTitle('How to cook - a guide')).toBe(false)
  })
})

describe('fetchOpenGraph', () => {
  it('reads Open Graph tags', async () => {
    mockFetch({
      'example.com': {
        html: `
          <meta property="og:title" content="OG Title" />
          <meta property="og:description" content="OG Description" />
          <meta property="og:image" content="https://cdn.example.com/img.jpg" />
          <title>Fallback Title</title>
        `,
      },
    })

    const meta = await fetchOpenGraph('https://example.com/post')
    expect(meta).toEqual({
      title: 'OG Title',
      description: 'OG Description',
      imageUrl: 'https://cdn.example.com/img.jpg',
    })
  })

  it('falls back to twitter: tags and <title>', async () => {
    mockFetch({
      'example.com': {
        html: `
          <title>Page Title</title>
          <meta name="twitter:description" content="Twitter Description" />
          <meta name="twitter:image" content="https://cdn.example.com/tw.png" />
        `,
      },
    })

    const meta = await fetchOpenGraph('https://example.com/post')
    expect(meta.title).toBe('Page Title')
    expect(meta.description).toBe('Twitter Description')
    expect(meta.imageUrl).toBe('https://cdn.example.com/tw.png')
  })

  it('strips the site-name suffix from <title> using og:site_name', async () => {
    mockFetch({
      'example.com': {
        html: `
          <meta property="og:site_name" content="Example Blog" />
          <meta property="og:image" content="https://cdn.example.com/x.png" />
          <title>My Great Article - Example Blog</title>
        `,
      },
    })

    const meta = await fetchOpenGraph('https://example.com/post')
    expect(meta.title).toBe('My Great Article')
  })

  it('resolves a relative og:image against the page URL', async () => {
    mockFetch({
      'example.com': {
        html: `
          <meta property="og:title" content="T" />
          <meta property="og:image" content="/media/cover.jpg" />
        `,
      },
    })

    const meta = await fetchOpenGraph('https://example.com/posts/my-slug')
    expect(meta.imageUrl).toBe('https://example.com/media/cover.jpg')
  })

  it('treats a degraded YouTube page as weak and fills from oEmbed', async () => {
    mockFetch({
      '/watch': {
        html: `
          <meta property="og:site_name" content="YouTube" />
          <meta property="og:description" content="Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube." />
          <title> - YouTube</title>
        `,
      },
      '/oembed': {
        json: {
          title: 'Real Video Title',
          thumbnail_url: 'https://i.ytimg.com/vi/abc/hqdefault.jpg',
        },
      },
    })

    const meta = await fetchOpenGraph('https://www.youtube.com/watch?v=abc')
    // weak title replaced by oEmbed; YouTube default description dropped
    expect(meta.title).toBe('Real Video Title')
    expect(meta.imageUrl).toBe('https://i.ytimg.com/vi/abc/hqdefault.jpg')
    expect(meta.description).toBeUndefined()
  })

  it('keeps a good YouTube OG title and does not need oEmbed', async () => {
    const spy = mockFetch({
      '/watch': {
        html: `
          <meta property="og:title" content="Good Title" />
          <meta property="og:description" content="A real description" />
          <meta property="og:image" content="https://i.ytimg.com/vi/abc/maxresdefault.jpg" />
          <title>Good Title - YouTube</title>
        `,
      },
      '/oembed': { json: { title: 'should not be used' } },
    })

    const meta = await fetchOpenGraph('https://www.youtube.com/watch?v=abc')
    expect(meta.title).toBe('Good Title')
    expect(meta.description).toBe('A real description')
    // image present + strong title → oEmbed not called
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('returns empty object on a non-ok response', async () => {
    mockFetch({ 'example.com': { ok: false, status: 404 } })
    const meta = await fetchOpenGraph('https://example.com/missing')
    expect(meta).toEqual({})
  })

  it('returns empty object when fetch throws (fails soft)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))
    const meta = await fetchOpenGraph('https://example.com/post')
    expect(meta).toEqual({})
  })
})
