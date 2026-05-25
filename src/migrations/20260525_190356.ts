import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_scheduled_social_posts_platform" ADD VALUE 'twitter' BEFORE 'bluesky';
  CREATE TABLE "twitter_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar,
  	"refresh_token" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"user_id" varchar,
  	"username" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "twitter_settings" CASCADE;
  ALTER TABLE "scheduled_social_posts" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_scheduled_social_posts_platform";
  CREATE TYPE "public"."enum_scheduled_social_posts_platform" AS ENUM('linkedin', 'bluesky', 'threads');
  ALTER TABLE "scheduled_social_posts" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_scheduled_social_posts_platform" USING "platform"::"public"."enum_scheduled_social_posts_platform";`)
}
