import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "social_posts" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "social_posts" ADD COLUMN "meta_image_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts" DROP COLUMN "meta_title";
  ALTER TABLE "social_posts" DROP COLUMN "meta_description";
  ALTER TABLE "social_posts" DROP COLUMN "meta_image_url";`)
}
