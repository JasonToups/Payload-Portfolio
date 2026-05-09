import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Resume } from '@/payload-types'
import { spawnSync } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params

  const resume = (await payload.findByID({
    collection: 'resumes',
    id,
    depth: 0,
  })) as Resume

  if (!resume.content) {
    return new Response('Resume content is empty', { status: 404 })
  }

  const timestamp = Date.now()
  const inputPath = join(tmpdir(), `resume-${timestamp}.md`)
  const outputPath = join(tmpdir(), `resume-${timestamp}.docx`)

  try {
    writeFileSync(inputPath, resume.content, 'utf-8')

    const result = spawnSync(
      'pandoc',
      [inputPath, '-f', 'markdown', '-t', 'docx', '-s', '-o', outputPath],
      { encoding: 'utf-8', timeout: 30_000 },
    )

    if (result.status !== 0) {
      const errMsg = result.stderr || result.error?.message || 'Pandoc failed'
      payload.logger.error({ err: errMsg }, 'DocX generation failed')
      return new Response(`DocX generation failed: ${errMsg}`, { status: 500 })
    }

    const docxBuffer = readFileSync(outputPath)

    return new Response(docxBuffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="resume.docx"',
      },
    })
  } finally {
    if (existsSync(inputPath)) unlinkSync(inputPath)
    if (existsSync(outputPath)) unlinkSync(outputPath)
  }
}
