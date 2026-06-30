import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_posts_social_shares_platform" ADD VALUE 'facebook';
  ALTER TYPE "public"."enum__posts_v_version_social_shares_platform" ADD VALUE 'facebook';
  ALTER TYPE "public"."enum_social_posts_platforms_platform" ADD VALUE 'facebook';
  ALTER TABLE "social_settings" ADD COLUMN "facebook_page_access_token" varchar;
  ALTER TABLE "social_settings" ADD COLUMN "facebook_page_id" varchar;
  ALTER TABLE "social_settings" ADD COLUMN "facebook_page_name" varchar;
  ALTER TABLE "social_settings" ADD COLUMN "facebook_expires_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_social_shares" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_social_shares_platform";
  CREATE TYPE "public"."enum_posts_social_shares_platform" AS ENUM('twitter', 'threads', 'bluesky', 'linkedin');
  ALTER TABLE "posts_social_shares" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_posts_social_shares_platform" USING "platform"::"public"."enum_posts_social_shares_platform";
  ALTER TABLE "_posts_v_version_social_shares" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_version_social_shares_platform";
  CREATE TYPE "public"."enum__posts_v_version_social_shares_platform" AS ENUM('twitter', 'threads', 'bluesky', 'linkedin');
  ALTER TABLE "_posts_v_version_social_shares" ALTER COLUMN "platform" SET DATA TYPE "public"."enum__posts_v_version_social_shares_platform" USING "platform"::"public"."enum__posts_v_version_social_shares_platform";
  ALTER TABLE "social_posts_platforms" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_social_posts_platforms_platform";
  CREATE TYPE "public"."enum_social_posts_platforms_platform" AS ENUM('linkedin', 'twitter', 'bluesky', 'threads');
  ALTER TABLE "social_posts_platforms" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_social_posts_platforms_platform" USING "platform"::"public"."enum_social_posts_platforms_platform";
  ALTER TABLE "social_settings" DROP COLUMN "facebook_page_access_token";
  ALTER TABLE "social_settings" DROP COLUMN "facebook_page_id";
  ALTER TABLE "social_settings" DROP COLUMN "facebook_page_name";
  ALTER TABLE "social_settings" DROP COLUMN "facebook_expires_at";`)
}
