import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Migrate existing ScheduledSocialPost records into SocialPosts before dropping the table
  await db.execute(sql`
   INSERT INTO "social_posts" (
    "title", "body", "linked_post_id", "platform", "status",
    "scheduled_for", "published_at", "published_url", "error_message",
    "short_url", "updated_at", "created_at"
  )
  SELECT
    CASE ssp.platform
      WHEN 'linkedin'  THEN 'LinkedIn'
      WHEN 'twitter'   THEN 'Twitter / X'
      WHEN 'bluesky'   THEN 'BlueSky'
      WHEN 'threads'   THEN 'Threads'
      ELSE ssp.platform::text
    END || ' — ' || COALESCE(p.title, 'Untitled') AS title,
    ssp.body,
    ssp.post_id,
    ssp.platform::text::"enum_social_posts_platform",
    ssp.status::text::"enum_social_posts_status",
    ssp.scheduled_for,
    ssp.published_at,
    ssp.published_url,
    ssp.error_message,
    ssp.short_url,
    ssp.updated_at,
    ssp.created_at
  FROM "scheduled_social_posts" ssp
  LEFT JOIN "posts" p ON p.id = ssp.post_id;`)

  await db.execute(sql`
   ALTER TABLE "scheduled_social_posts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "scheduled_social_posts" CASCADE;

  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'publishSocialPost', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'publishSocialPost', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_scheduled_social_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "scheduled_social_posts_id";
  DROP TYPE "public"."enum_scheduled_social_posts_platform";
  DROP TYPE "public"."enum_scheduled_social_posts_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_scheduled_social_posts_platform" AS ENUM('linkedin', 'twitter', 'bluesky', 'threads');
  CREATE TYPE "public"."enum_scheduled_social_posts_status" AS ENUM('pending', 'processing', 'published', 'failed', 'cancelled');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'publishScheduledSocialPost' BEFORE 'publishSocialPost';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'publishScheduledSocialPost' BEFORE 'publishSocialPost';
  CREATE TABLE "scheduled_social_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL,
  	"platform" "enum_scheduled_social_posts_platform" NOT NULL,
  	"body" varchar NOT NULL,
  	"scheduled_for" timestamp(3) with time zone NOT NULL,
  	"status" "enum_scheduled_social_posts_status" DEFAULT 'pending',
  	"published_at" timestamp(3) with time zone,
  	"published_url" varchar,
  	"error_message" varchar,
  	"short_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "scheduled_social_posts_id" integer;
  ALTER TABLE "scheduled_social_posts" ADD CONSTRAINT "scheduled_social_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "scheduled_social_posts_post_idx" ON "scheduled_social_posts" USING btree ("post_id");
  CREATE INDEX "scheduled_social_posts_updated_at_idx" ON "scheduled_social_posts" USING btree ("updated_at");
  CREATE INDEX "scheduled_social_posts_created_at_idx" ON "scheduled_social_posts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_scheduled_social_posts_fk" FOREIGN KEY ("scheduled_social_posts_id") REFERENCES "public"."scheduled_social_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_scheduled_social_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("scheduled_social_posts_id");`)
}
