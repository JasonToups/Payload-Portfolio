export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { marked } from 'marked'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import type { Resume } from '@/payload-types'
import ResumePageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'resumes',
    where: { _status: { equals: 'published' } },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })
  const resume = docs[0] as Resume | undefined
  return { title: resume?.title ?? 'Resume' }
}

export default async function ResumePage() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'resumes',
    draft,
    ...(draft ? {} : { where: { _status: { equals: 'published' } } }),
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })

  const resume = docs[0] as Resume | undefined
  if (!resume) notFound()

  const html = resume.content ? await marked(resume.content) : ''

  return (
    <>
      <ResumePageClient />
      {draft && <LivePreviewListener />}
      <link rel="stylesheet" href="/resume-stylesheet.css" />
      <style dangerouslySetInnerHTML={{ __html: `html,body{max-width:none;margin:0;padding:0;}` }} />
      <div className="resume container mx-auto px-6 py-8" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
