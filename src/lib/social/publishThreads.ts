// Max Vercel function duration — Threads requires a ~35s wait between container create and publish
export const maxDuration = 60

type ThreadsSettings = {
  accessToken: string
  userId: string
  expiresAt?: string | null
}

type PublishThreadsOptions = {
  body: string
  settings: ThreadsSettings
}

type ThreadsCreateResponse = { id: string }
type ThreadsPublishResponse = { id: string }

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function publishThreads(options: PublishThreadsOptions): Promise<{ url: string }> {
  const { body, settings } = options
  const { accessToken, userId, expiresAt } = settings

  if (expiresAt && new Date(expiresAt) <= new Date()) {
    throw new Error('Threads token has expired. Re-authorize from the admin panel.')
  }

  // Step 1: Create a container
  const createRes = await fetch(
    `https://graph.threads.net/v1.0/${userId}/threads`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'TEXT',
        text: body,
        access_token: accessToken,
      }),
    },
  )

  if (!createRes.ok) {
    const errorBody = await createRes.text()
    throw new Error(`Threads create error: ${errorBody}`)
  }

  const { id: creationId } = (await createRes.json()) as ThreadsCreateResponse

  // Step 2: Wait for the container to reach FINISHED state (~30s per Meta docs)
  await sleep(35_000)

  // Step 3: Publish the container
  const publishRes = await fetch(
    `https://graph.threads.net/v1.0/${userId}/threads_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    },
  )

  if (!publishRes.ok) {
    const errorBody = await publishRes.text()
    throw new Error(`Threads publish error: ${errorBody}`)
  }

  const { id: threadId } = (await publishRes.json()) as ThreadsPublishResponse

  return { url: `https://www.threads.net/t/${threadId}` }
}
