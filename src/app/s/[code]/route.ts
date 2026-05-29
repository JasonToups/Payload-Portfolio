import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

type RouteParams = { params: Promise<{ code: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { code } = await params

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'short-urls',
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const doc = result.docs[0]
  if (!doc) {
    return NextResponse.redirect(getServerSideURL(), { status: 302 })
  }

  return NextResponse.redirect(doc.targetUrl as string, { status: 301 })
}
