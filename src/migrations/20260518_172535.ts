import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "social_post_body" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_social_post_body" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "social_post_body";
  ALTER TABLE "_posts_v" DROP COLUMN "version_social_post_body";`)
}
