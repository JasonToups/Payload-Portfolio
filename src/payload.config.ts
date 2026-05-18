import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import type { Payload, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Keywords } from './collections/Keywords'
import { Broadcasts } from './collections/Broadcasts'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Resume } from './collections/Resume'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { SiteSettings } from './SiteSettings/SiteSettings'
import { EmailSettings } from './EmailSettings'
import { EmailLayout } from './EmailLayout'
import { SubscribePostBlock } from './SubscribePostBlock/config'
import { subscribeForm } from './endpoints/seed/subscribe-form'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function ensureDefaultForms(payload: Payload) {
  const defaults = [subscribeForm]

  for (const form of defaults) {
    const title = form?.title
    if (!title) continue

    const existing = await payload.find({
      collection: 'forms',
      where: { title: { equals: title } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    // IMPORTANT: Avoid updating existing seeded forms during onInit.
    // With the Drizzle adapter, updates can crash during write transforms when legacy/null values exist.
    // We only seed the form if it does not exist.
    if (existing?.docs?.length) continue

    await payload.create({
      collection: 'forms',
      data: form,
      overrideAccess: true,
    })
  }
}


export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
        {
          label: 'Email',
          name: 'email',
          width: 600,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  collections: [Broadcasts, Pages, Posts, Media, Categories, Keywords, Resume, Users],
  cors: [getServerSideURL()].filter(Boolean),
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY!,
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS!,
    defaultFromName: process.env.RESEND_FROM_NAME!,
  }),
  globals: [Header, Footer, SiteSettings, EmailSettings, EmailLayout, SubscribePostBlock],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  onInit: async (payload) => {
    await ensureDefaultForms(payload)
  },
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
