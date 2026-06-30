import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchOpenGraph } from '@/utilities/fetchOpenGraph'

const mockHtmlResponse = (html: string, ok = true, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    status,
    text: async () => html,
  } as Response)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchOpenGraph', () => {
  it('reads Open Graph tags', async () => {
    mockHtmlResponse(`
      <html><head>
        <meta property="og:title" content="OG Title" />
        <meta property="og:description" content="OG Description" />
        <meta property="og:image" content="https://cdn.example.com/img.jpg" />
        <title>Fallback Title</title>
      </head></html>
    `)

    const meta = await fetchOpenGraph('https://example.com/post')
    expect(meta).toEqual({
      title: 'OG Title',
      description: 'OG Description',
      imageUrl: 'https://cdn.example.com/img.jpg',
    })
  })

  it('falls back to twitter: tags and <title>', async () => {
    mockHtmlResponse(`
      <html><head>
        <title>Page Title</title>
        <meta name="twitter:description" content="Twitter Description" />
        <meta name="twitter:image" content="https://cdn.example.com/tw.png" />
      </head></html>
    `)

    const meta = await fetchOpenGraph('https://example.com/post')
    expect(meta.title).toBe('Page Title')
    expect(meta.description).toBe('Twitter Description')
    expect(meta.imageUrl).toBe('https://cdn.example.com/tw.png')
  })

  it('falls back to meta name="description"', async () => {
    mockHtmlResponse(`
      <html><head>
        <meta property="og:title" content="T" />
        <meta name="description" content="Plain meta description" />
      </head></html>
    `)

    const meta = await fetchOpenGraph('https://example.com/post')
    expect(meta.description).toBe('Plain meta description')
  })

  it('resolves a relative og:image against the page URL', async () => {
    mockHtmlResponse(`
      <html><head>
        <meta property="og:title" content="T" />
        <meta property="og:image" content="/media/cover.jpg" />
      </head></html>
    `)

    const meta = await fetchOpenGraph('https://example.com/posts/my-slug')
    expect(meta.imageUrl).toBe('https://example.com/media/cover.jpg')
  })

  it('returns empty object on a non-ok response', async () => {
    mockHtmlResponse('<html></html>', false, 404)
    const meta = await fetchOpenGraph('https://example.com/missing')
    expect(meta).toEqual({})
  })

  it('returns empty object when fetch throws (fails soft)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))
    const meta = await fetchOpenGraph('https://example.com/post')
    expect(meta).toEqual({})
  })
})
