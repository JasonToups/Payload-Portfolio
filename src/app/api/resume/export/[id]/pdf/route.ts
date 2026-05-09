import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Resume } from '@/payload-types'
import { spawnSync } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir, platform } from 'os'
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
  const cssPath = join(process.cwd(), 'public', 'resume-stylesheet.css')
  const inputPath = join(tmpdir(), `resume-${timestamp}.md`)
  const outputPath = join(tmpdir(), `resume-${timestamp}.pdf`)

  try {
    writeFileSync(inputPath, resume.content, 'utf-8')

    const pandocArgs = [
      inputPath,
      '-f',
      'markdown',
      '-t',
      'pdf',
      '--pdf-engine=wkhtmltopdf',
      '-c',
      cssPath,
      '-s',
      '-V',
      'margin-top=0',
      '-V',
      'margin-bottom=0',
      '-V',
      'margin-left=0',
      '-V',
      'margin-right=0',
      '-o',
      outputPath,
    ]

    // xvfb-run is Linux-only (virtual X11 display for headless wkhtmltopdf).
    // macOS uses native graphics and doesn't need it.
    const [cmd, args] =
      platform() === 'darwin'
        ? (['pandoc', pandocArgs] as const)
        : (['xvfb-run', ['pandoc', ...pandocArgs]] as const)

    const result = spawnSync(cmd, args, { encoding: 'utf-8', timeout: 30_000 })

    if (result.status !== 0) {
      const errMsg = result.stderr || result.error?.message || 'Pandoc failed'
      payload.logger.error({ err: errMsg }, 'PDF generation failed')
      return new Response(`PDF generation failed: ${errMsg}`, { status: 500 })
    }

    const pdfBuffer = readFileSync(outputPath)

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    })
  } finally {
    if (existsSync(inputPath)) unlinkSync(inputPath)
    if (existsSync(outputPath)) unlinkSync(outputPath)
  }
}
