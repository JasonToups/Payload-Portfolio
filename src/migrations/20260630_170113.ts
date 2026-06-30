import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_social_posts_post_type" ADD VALUE 'linkedPost' BEFORE 'image';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts" ALTER COLUMN "post_type" SET DATA TYPE text;
  ALTER TABLE "social_posts" ALTER COLUMN "post_type" SET DEFAULT 'url'::text;
  DROP TYPE "public"."enum_social_posts_post_type";
  CREATE TYPE "public"."enum_social_posts_post_type" AS ENUM('url', 'image', 'content');
  ALTER TABLE "social_posts" ALTER COLUMN "post_type" SET DEFAULT 'url'::"public"."enum_social_posts_post_type";
  ALTER TABLE "social_posts" ALTER COLUMN "post_type" SET DATA TYPE "public"."enum_social_posts_post_type" USING "post_type"::"public"."enum_social_posts_post_type";`)
}
