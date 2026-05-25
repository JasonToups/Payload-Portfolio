import { BskyAgent, RichText } from '@atproto/api'

type BlueSkySettings = {
  handle: string
  appPassword: string
  did?: string | null
}

type PublishBlueSkyOptions = {
  body: string
  settings: BlueSkySettings
}

export async function publishBlueSky(options: PublishBlueSkyOptions): Promise<{ url: string }> {
  const { body, settings } = options
  const { handle, appPassword, did } = settings

  const agent = new BskyAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password: appPassword })

  const rt = new RichText({ text: body })
  await rt.detectFacets(agent)

  const record = await agent.post({
    text: rt.text,
    facets: rt.facets,
    langs: ['en'],
  })

  const resolvedDid = did ?? agent.session?.did
  const rkey = record.uri.split('/').pop()

  return {
    url: resolvedDid
      ? `https://bsky.app/profile/${resolvedDid}/post/${rkey}`
      : 'https://bsky.app',
  }
}
