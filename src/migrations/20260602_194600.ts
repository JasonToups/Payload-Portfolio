import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_posts_post_type" AS ENUM('url', 'image', 'content');
  ALTER TABLE "social_posts" ADD COLUMN "post_type" "enum_social_posts_post_type" DEFAULT 'url' NOT NULL;
  ALTER TABLE "social_posts" ADD COLUMN "url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts" DROP COLUMN "post_type";
  ALTER TABLE "social_posts" DROP COLUMN "url";
  DROP TYPE "public"."enum_social_posts_post_type";`)
}
