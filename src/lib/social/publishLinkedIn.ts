import { getServerSideURL } from '@/utilities/getURL'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type LinkedInSettings = {
  accessToken: string
  personUrn: string
  expiresAt?: string | null
}

type PublishLinkedInOptions = {
  body: string
  url: string
  title: string
  description?: string
  imageUrl?: string
  settings: LinkedInSettings
}

type LinkedInInitUploadResponse = { value: { uploadUrl: string; image: string } }

async function uploadImageToLinkedIn(
  imageUrl: string,
  ownerUrn: string,
  accessToken: string,
): Promise<string | null> {
  const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202604',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({ initializeUploadRequest: { owner: ownerUrn } }),
  })
  if (!initRes.ok) {
    console.error('LinkedIn initializeUpload failed:', initRes.status, await initRes.text())
    return null
  }

  const { value } = (await initRes.json()) as LinkedInInitUploadResponse
  const { uploadUrl, image: imageUrn } = value

  const absoluteImageUrl = imageUrl.startsWith('http')
    ? imageUrl
    : `${getServerSideURL()}${imageUrl}`
  const imgRes = await fetch(absoluteImageUrl)
  if (!imgRes.ok) {
    console.error('LinkedIn image fetch failed:', imgRes.status, absoluteImageUrl)
    return null
  }
  const imgBuffer = await imgRes.arrayBuffer()
  const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': contentType,
    },
    body: imgBuffer,
  })
  if (!uploadRes.ok) {
    console.error('LinkedIn image PUT upload failed:', uploadRes.status, await uploadRes.text())
    return null
  }

  // LinkedIn processes images asynchronously — poll until AVAILABLE before using the URN in a post
  type LinkedInImageStatus = { status?: string }
  for (let i = 0; i < 10; i++) {
    await sleep(1000)
    const statusRes = await fetch(
      `https://api.linkedin.com/rest/images/${encodeURIComponent(imageUrn)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': '202604',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      },
    )
    if (statusRes.ok) {
      const data = (await statusRes.json()) as LinkedInImageStatus
      if (data.status === 'AVAILABLE') break
    }
  }

  return imageUrn
}

export async function publishLinkedIn(options: PublishLinkedInOptions): Promise<{ url: string }> {
  const { body, url, title, description, imageUrl, settings } = options
  const { accessToken, personUrn, expiresAt } = settings

  if (expiresAt && new Date(expiresAt) <= new Date()) {
    throw new Error('LinkedIn token has expired. Re-authorize from the admin panel.')
  }

  let thumbnailUrn: string | null = null
  if (imageUrl) {
    thumbnailUrn = await uploadImageToLinkedIn(imageUrl, personUrn, accessToken)
  }

  const linkedInBody = {
    author: personUrn,
    commentary: body,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED' },
    content: {
      article: {
        source: url,
        title,
        ...(description ? { description } : {}),
        ...(thumbnailUrn ? { thumbnail: thumbnailUrn } : {}),
      },
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202604',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(linkedInBody),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`LinkedIn API error: ${errorBody}`)
  }

  const linkedInPostId = res.headers.get('x-restli-id')
  return {
    url: linkedInPostId
      ? `https://www.linkedin.com/feed/update/${linkedInPostId}`
      : 'https://www.linkedin.com/feed/',
  }
}
