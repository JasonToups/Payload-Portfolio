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
  imageUrl?: string
  imageUrls?: string[]
}

async function uploadBlob(agent: BskyAgent, url: string): Promise<BlobRef> {
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const { data } = await agent.uploadBlob(buf, { encoding: contentType })
  return data.blob
}

export async function publishBlueSky(options: PublishBlueSkyOptions): Promise<{ url: string }> {
  const { body, settings, postUrl, title, description, imageUrl, imageUrls } = options
  const { handle, appPassword } = settings

  const agent = new BskyAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password: appPassword })

  const rt = new RichText({ text: body })
  await rt.detectFacets(agent)

  let embed: { $type: string; external: ExternalEmbed } | BlueSkyImagesEmbed | undefined

  if (imageUrls && imageUrls.length > 0) {
    // Native image embed — up to 4 images; takes priority over link card
    const blobs = await Promise.all(
      imageUrls.slice(0, 4).map(async (url) => ({
        image: await uploadBlob(agent, url),
        alt: '',
      })),
    )
    embed = { $type: 'app.bsky.embed.images', images: blobs }
  } else if (postUrl) {
    // External link embed with optional single-image thumbnail
    let thumb: BlobRef | undefined
    if (imageUrl) {
      thumb = await uploadBlob(agent, imageUrl)
    }
    embed = {
      $type: 'app.bsky.embed.external',
      external: {
        uri: postUrl,
        title: title ?? '',
        description: description ?? '',
        ...(thumb ? { thumb } : {}),
      },
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
