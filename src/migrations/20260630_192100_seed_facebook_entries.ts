import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'
import { composePlatformBody, type KeywordLike } from '@/lib/social/composePlatformBody'
import type { PlatformEntry } from '@/collections/SocialPosts/types'
import type { Keyword, SocialPost } from '@/payload-types'

/**
 * Seed a Facebook entry (status 'draft', composed body) onto every existing social post that
 * was already published to at least one other platform. Separate from the enum migration
 * because Postgres cannot use a freshly-added enum value ('facebook') in the same transaction
 * that added it. Written via direct SQL INSERT to avoid firing collection hooks.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({
    collection: 'social-posts',
    depth: 2,
    limit: 1000,
    overrideAccess: true,
    req,
  })

  for (const doc of docs as SocialPost[]) {
    const platforms = (doc.platforms ?? []) as PlatformEntry[]
    if (!platforms.some((p) => p.status === 'published')) continue
    if (platforms.some((p) => p.platform === 'facebook')) continue

    const keywords: KeywordLike[] = ((doc.keywords ?? []) as (number | Keyword)[])
      .filter((k): k is Keyword => typeof k === 'object' && typeof k.name === 'string')
      .map((k) => ({ name: k.name }))

    const body = composePlatformBody('facebook', doc.body ?? '', keywords)
    const nextOrder = platforms.length + 1

    await db.execute(sql`
      INSERT INTO "social_posts_platforms" ("_order", "_parent_id", "id", "platform", "status", "body")
      VALUES (${nextOrder}, ${doc.id}, gen_random_uuid()::varchar, 'facebook', 'draft', ${body});`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DELETE FROM "social_posts_platforms" WHERE "platform" = 'facebook';`)
}
