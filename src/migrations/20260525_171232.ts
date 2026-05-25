import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_scheduled_social_posts_platform" AS ENUM('linkedin', 'bluesky', 'threads');
  CREATE TYPE "public"."enum_scheduled_social_posts_status" AS ENUM('pending', 'processing', 'published', 'failed', 'cancelled');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'publishScheduledSocialPost' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'publishScheduledSocialPost' BEFORE 'schedulePublish';
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
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "threads_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar,
  	"user_id" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "bluesky_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"handle" varchar,
  	"app_password" varchar,
  	"did" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "scheduled_social_posts_id" integer;
  ALTER TABLE "scheduled_social_posts" ADD CONSTRAINT "scheduled_social_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "scheduled_social_posts_post_idx" ON "scheduled_social_posts" USING btree ("post_id");
  CREATE INDEX "scheduled_social_posts_updated_at_idx" ON "scheduled_social_posts" USING btree ("updated_at");
  CREATE INDEX "scheduled_social_posts_created_at_idx" ON "scheduled_social_posts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_scheduled_social_posts_fk" FOREIGN KEY ("scheduled_social_posts_id") REFERENCES "public"."scheduled_social_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_scheduled_social_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("scheduled_social_posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "scheduled_social_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "threads_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bluesky_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "scheduled_social_posts" CASCADE;
  DROP TABLE "threads_settings" CASCADE;
  DROP TABLE "bluesky_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_scheduled_social_posts_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_scheduled_social_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "scheduled_social_posts_id";
  DROP TYPE "public"."enum_scheduled_social_posts_platform";
  DROP TYPE "public"."enum_scheduled_social_posts_status";`)
}
