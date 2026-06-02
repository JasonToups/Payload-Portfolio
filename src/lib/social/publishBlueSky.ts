import { BlobRef, BskyAgent, RichText } from '@atproto/api'

type BlueSkySettings = {
  handle: string
  appPassword: string
}

type ExternalEmbed = {
  uri: string
  title: string
  description: string
  thumb?: BlobRef
}

type BlueSkyImagesEmbed = {
  $type: 'app.bsky.embed.images'
  images: Array<{ image: BlobRef; alt: string }>
}

type PublishBlueSkyOptions = {
  body: string
  settings: BlueSkySettings
  postUrl?: string
  title?: string
  description?: string
  imageUrls?: string[]
}

async function uploadBlob(agent: BskyAgent, url: string): Promise<BlobRef | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error('BlueSky image fetch failed:', res.status, url)
      return null
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const { data } = await agent.uploadBlob(buf, { encoding: contentType })
    return data.blob
  } catch (err) {
    console.error('BlueSky uploadBlob error:', err)
    return null
  }
}

export async function publishBlueSky(options: PublishBlueSkyOptions): Promise<{ url: string }> {
  const { body, settings, postUrl, title, description, imageUrls } = options
  const { handle, appPassword } = settings

  const agent = new BskyAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password: appPassword })

  const rt = new RichText({ text: body })
  await rt.detectFacets(agent)

  let embed: { $type: string; external: ExternalEmbed } | BlueSkyImagesEmbed | undefined

  if (postUrl) {
    // Website card embed — matches app.bsky.embed.external spec
    // Thumb is optional; if upload fails the card still posts without an image
    const thumbBlob = imageUrls?.[0] ? await uploadBlob(agent, imageUrls[0]) : null
    embed = {
      $type: 'app.bsky.embed.external',
      external: {
        uri: postUrl,
        title: title ?? '',
        description: description ?? '',
        ...(thumbBlob ? { thumb: thumbBlob } : {}),
      },
    }
  } else if (imageUrls && imageUrls.length > 0) {
    // Pure image post — no URL to card, upload up to 4 images
    const blobs = (
      await Promise.all(
        imageUrls.slice(0, 4).map(async (url) => {
          const blob = await uploadBlob(agent, url)
          return blob ? { image: blob, alt: '' } : null
        }),
      )
    ).filter((b): b is { image: BlobRef; alt: string } => b !== null)

    if (blobs.length > 0) {
      embed = { $type: 'app.bsky.embed.images', images: blobs }
    }
  }

  const record = await agent.post({
    text: rt.text,
    facets: rt.facets,
    langs: ['en'],
    embed,
  })

  const rkey = record.uri.split('/').pop()
  const did = agent.session?.did

  return {
    url: did
      ? `https://bsky.app/profile/${did}/post/${rkey}`
      : `https://bsky.app/profile/${handle}/post/${rkey}`,
  }
}
