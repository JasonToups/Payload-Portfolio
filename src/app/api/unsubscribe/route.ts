import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  verifyUnsubscribeToken,
  unsubscribeContactFromAudience,
} from '../../../resend/contacts'

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email || !token) {
    return new Response('Missing unsubscribe parameters', { status: 400 })
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new Response('Invalid unsubscribe link', { status: 403 })
  }

  const payload = await getPayload({ config })
  const result = await unsubscribeContactFromAudience(payload, email)

  if (result.status === 'error') {
    console.error('[Unsubscribe] Failed to unsubscribe contact', { email, result })
    return new Response('Failed to process unsubscribe request', { status: 500 })
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Unsubscribed</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f3ef; font-family: 'Plus Jakarta Sans', Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border: 1px solid #e2ddd6; border-radius: 12px; padding: 3rem 2.5rem; max-width: 480px; width: 100%; text-align: center; }
    h1 { font-family: Georgia, serif; font-size: 1.75rem; color: #1e1c18; margin: 0 0 1rem; }
    p { color: #6b6560; font-size: 1rem; line-height: 1.65; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>You've been unsubscribed</h1>
    <p>You've been removed from the mailing list. You won't receive any further emails from us.</p>
  </div>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
