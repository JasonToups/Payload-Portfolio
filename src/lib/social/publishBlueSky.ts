import { BskyAgent, RichText } from '@atproto/api'

type BlueSkySettings = {
  handle: string
  appPassword: string
}

type PublishBlueSkyOptions = {
  body: string
  settings: BlueSkySettings
}

export async function publishBlueSky(options: PublishBlueSkyOptions): Promise<{ url: string }> {
  const { body, settings } = options
  const { handle, appPassword } = settings

  const agent = new BskyAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password: appPassword })

  const rt = new RichText({ text: body })
  await rt.detectFacets(agent)

  const record = await agent.post({
    text: rt.text,
    facets: rt.facets,
    langs: ['en'],
  })

  const rkey = record.uri.split('/').pop()
  const did = agent.session?.did

  return {
    url: did
      ? `https://bsky.app/profile/${did}/post/${rkey}`
      : `https://bsky.app/profile/${handle}/post/${rkey}`,
  }
}
