import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { handleNewsletterSubscribe } from '@/resend/newsletter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body as { email: string }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    await handleNewsletterSubscribe(payload, email.trim().toLowerCase())

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
