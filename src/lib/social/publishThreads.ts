// Max Vercel function duration — Threads requires a ~35s wait between container create and publish
export const maxDuration = 60

type ThreadsSettings = {
  accessToken: string
  userId: string
  expiresAt?: string | null
}

type PublishThreadsOptions = {
  body: string
  topicTag?: string
  imageUrls?: string[]
  linkAttachment?: string
  settings: ThreadsSettings
}

type ThreadsCreateResponse = { id: string }
type ThreadsPublishResponse = { id: string }

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function createItemContainer(
  userId: string,
  accessToken: string,
  imageUrl: string,
): Promise<string> {
  const res = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'IMAGE',
      image_url: imageUrl,
      is_carousel_item: true,
      access_token: accessToken,
    }),
  })
  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Threads carousel item create error: ${errorBody}`)
  }
  const { id } = (await res.json()) as ThreadsCreateResponse
  return id
}

export async function publishThreads(options: PublishThreadsOptions): Promise<{ url: string }> {
  const { body, topicTag, imageUrls = [], linkAttachment, settings } = options
  const { accessToken, userId, expiresAt } = settings

  if (expiresAt && new Date(expiresAt) <= new Date()) {
    throw new Error('Threads token has expired. Re-authorize from the admin panel.')
  }

  const topicTagParam = topicTag ? { topic_tag: topicTag } : {}
  let creationId: string

  if (imageUrls.length === 0) {
    // Text-only post
    const createRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'TEXT',
        text: body,
        access_token: accessToken,
        ...topicTagParam,
        ...(linkAttachment ? { link_attachment: linkAttachment } : {}),
      }),
    })
    if (!createRes.ok) {
      const errorBody = await createRes.text()
      throw new Error(`Threads create error: ${errorBody}`)
    }
    creationId = ((await createRes.json()) as ThreadsCreateResponse).id
  } else if (imageUrls.length === 1) {
    // Single image post
    const createRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'IMAGE',
        image_url: imageUrls[0],
        text: body,
        access_token: accessToken,
        ...topicTagParam,
      }),
    })
    if (!createRes.ok) {
      const errorBody = await createRes.text()
      throw new Error(`Threads image create error: ${errorBody}`)
    }
    creationId = ((await createRes.json()) as ThreadsCreateResponse).id
  } else {
    // Carousel post (2–20 images)
    const itemIds = await Promise.all(
      imageUrls.map((url) => createItemContainer(userId, accessToken, url)),
    )

    const carouselRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: itemIds.join(','),
        text: body,
        access_token: accessToken,
        ...topicTagParam,
      }),
    })
    if (!carouselRes.ok) {
      const errorBody = await carouselRes.text()
      throw new Error(`Threads carousel create error: ${errorBody}`)
    }
    creationId = ((await carouselRes.json()) as ThreadsCreateResponse).id
  }

  // Wait for the container to reach FINISHED state (~30s per Meta docs)
  await sleep(35_000)

  // Publish the container
  const publishRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: accessToken,
    }),
  })

  if (!publishRes.ok) {
    const errorBody = await publishRes.text()
    throw new Error(`Threads publish error: ${errorBody}`)
  }

  const { id: threadId } = (await publishRes.json()) as ThreadsPublishResponse

  return { url: `https://www.threads.net/t/${threadId}` }
}
