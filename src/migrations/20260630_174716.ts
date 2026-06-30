import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_posts_publish_status" AS ENUM('draft', 'scheduled', 'published', 'partial', 'failed');
  ALTER TABLE "social_posts" ADD COLUMN "publish_status" "enum_social_posts_publish_status" DEFAULT 'draft';`)

  // Backfill Publish Date for never-scheduled posts: earliest platform publish, else created_at
  await db.execute(sql`
   UPDATE "social_posts" s SET "scheduled_for" = COALESCE(
     (SELECT MIN(p."published_at") FROM "social_posts_platforms" p WHERE p."_parent_id" = s."id"),
     s."created_at")
   WHERE s."scheduled_for" IS NULL;`)

  // Backfill aggregate status from platform statuses (mirrors computePublishStatus)
  await db.execute(sql`
   UPDATE "social_posts" s SET "publish_status" = sub.st::"enum_social_posts_publish_status"
   FROM (
     SELECT s2."id", CASE
       WHEN COUNT(p.*) FILTER (WHERE p."status" IN ('pending','processing')) > 0 THEN 'scheduled'
       WHEN COUNT(p.*) FILTER (WHERE p."status" = 'published') > 0
            AND COUNT(p.*) FILTER (WHERE p."status" = 'failed') > 0 THEN 'partial'
       WHEN COUNT(p.*) FILTER (WHERE p."status" = 'published') > 0 THEN 'published'
       WHEN COUNT(p.*) FILTER (WHERE p."status" = 'failed') > 0 THEN 'failed'
       ELSE 'draft' END AS st
     FROM "social_posts" s2
     LEFT JOIN "social_posts_platforms" p ON p."_parent_id" = s2."id"
     GROUP BY s2."id") sub
   WHERE sub."id" = s."id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts" DROP COLUMN "publish_status";
  DROP TYPE "public"."enum_social_posts_publish_status";`)
}
