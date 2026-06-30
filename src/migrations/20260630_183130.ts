import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'
import { composePlatformBody, type KeywordLike } from '@/lib/social/composePlatformBody'
import type { PlatformEntry } from '@/collections/SocialPosts/types'
import type { Keyword, SocialPost } from '@/payload-types'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts_platforms" ADD COLUMN "body" varchar;`)

  // Backfill each platform entry's body with what was actually sent, composed from the base
  // body + keywords using the same rules the publish job used. Written directly to the array
  // table by row PK so collection hooks (meta scraping, etc.) don't fire during the migration.
  const { docs } = await payload.find({
    collection: 'social-posts',
    depth: 2,
    limit: 1000,
    overrideAccess: true,
    req,
  })

  for (const doc of docs as SocialPost[]) {
    const keywords: KeywordLike[] = ((doc.keywords ?? []) as (number | Keyword)[])
      .filter((k): k is Keyword => typeof k === 'object' && typeof k.name === 'string')
      .map((k) => ({ name: k.name }))

    for (const entry of (doc.platforms ?? []) as PlatformEntry[]) {
      if (entry.body || !entry.id) continue
      const body = composePlatformBody(entry.platform, doc.body ?? '', keywords)
      await db.execute(
        sql`UPDATE "social_posts_platforms" SET "body" = ${body} WHERE "id" = ${entry.id};`,
      )
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts_platforms" DROP COLUMN "body";`)
}
