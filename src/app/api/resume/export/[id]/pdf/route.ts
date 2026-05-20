import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Resume } from '@/payload-types'
import { marked } from 'marked'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { platform } from 'os'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const maxDuration = 60

const MACOS_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
]

async function getBrowserConfig(): Promise<{ executablePath: string; args: string[] }> {
  if (platform() === 'darwin') {
    const found = MACOS_CHROME_PATHS.find(existsSync)
    if (found) return { executablePath: found, args: [] }
  }
  return { executablePath: await chromium.executablePath(), args: chromium.args }
}

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

  const cssPath = join(process.cwd(), 'public', 'resume-stylesheet.css')
  const css = readFileSync(cssPath, 'utf-8')
  const bodyHtml = await marked(resume.content)

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>${css}</style>
</head>
<body>${bodyHtml}</body>
</html>`

  const { executablePath, args } = await getBrowserConfig()

  const browser = await puppeteer.launch({
    args,
    defaultViewport: null,
    executablePath,
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    payload.logger.error({ err: msg }, 'PDF generation failed')
    return new Response(`PDF generation failed: ${msg}`, { status: 500 })
  } finally {
    await browser.close()
  }
}
