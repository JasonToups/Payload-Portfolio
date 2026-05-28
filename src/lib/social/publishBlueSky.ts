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

type PublishBlueSkyOptions = {
  body: string
  settings: BlueSkySettings
  postUrl?: string
  title?: string
  description?: string
  imageUrl?: string
}

export async function publishBlueSky(options: PublishBlueSkyOptions): Promise<{ url: string }> {
  const { body, settings, postUrl, title, description, imageUrl } = options
  const { handle, appPassword } = settings

  const agent = new BskyAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password: appPassword })

  const rt = new RichText({ text: body })
  await rt.detectFacets(agent)

  let embed: { $type: string; external: ExternalEmbed } | undefined

  if (postUrl) {
    let thumb: BlobRef | undefined
    if (imageUrl) {
      const res = await fetch(imageUrl)
      const buf = Buffer.from(await res.arrayBuffer())
      const contentType = res.headers.get('content-type') ?? 'image/jpeg'
      const { data } = await agent.uploadBlob(buf, { encoding: contentType })
      thumb = data.blob
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
