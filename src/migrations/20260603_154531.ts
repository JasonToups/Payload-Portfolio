import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_posts_platforms_platform" AS ENUM('linkedin', 'twitter', 'bluesky', 'threads');
  CREATE TYPE "public"."enum_social_posts_platforms_status" AS ENUM('draft', 'pending', 'processing', 'published', 'failed', 'cancelled');
  CREATE TABLE "social_posts_platforms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_social_posts_platforms_platform" NOT NULL,
  	"status" "enum_social_posts_platforms_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"published_url" varchar,
  	"error_message" varchar
  );
  
  ALTER TABLE "social_posts_platforms" ADD CONSTRAINT "social_posts_platforms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "social_posts_platforms_order_idx" ON "social_posts_platforms" USING btree ("_order");
  CREATE INDEX "social_posts_platforms_parent_id_idx" ON "social_posts_platforms" USING btree ("_parent_id");
  INSERT INTO "social_posts_platforms" ("_order", "_parent_id", "id", "platform", "status", "published_at", "published_url", "error_message")
  SELECT 1, id, gen_random_uuid()::varchar, platform::text::"enum_social_posts_platforms_platform", status::text::"enum_social_posts_platforms_status", published_at, published_url, error_message
  FROM "social_posts"
  WHERE platform IS NOT NULL;
  ALTER TABLE "social_posts" DROP COLUMN "platform";
  ALTER TABLE "social_posts" DROP COLUMN "status";
  ALTER TABLE "social_posts" DROP COLUMN "published_at";
  ALTER TABLE "social_posts" DROP COLUMN "published_url";
  ALTER TABLE "social_posts" DROP COLUMN "error_message";
  DROP TYPE "public"."enum_social_posts_platform";
  DROP TYPE "public"."enum_social_posts_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_posts_platform" AS ENUM('linkedin', 'twitter', 'bluesky', 'threads');
  CREATE TYPE "public"."enum_social_posts_status" AS ENUM('draft', 'pending', 'processing', 'published', 'failed', 'cancelled');
  DROP TABLE "social_posts_platforms" CASCADE;
  ALTER TABLE "social_posts" ADD COLUMN "platform" "enum_social_posts_platform" NOT NULL;
  ALTER TABLE "social_posts" ADD COLUMN "status" "enum_social_posts_status" DEFAULT 'draft';
  ALTER TABLE "social_posts" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "social_posts" ADD COLUMN "published_url" varchar;
  ALTER TABLE "social_posts" ADD COLUMN "error_message" varchar;
  DROP TYPE "public"."enum_social_posts_platforms_platform";
  DROP TYPE "public"."enum_social_posts_platforms_status";`)
}
