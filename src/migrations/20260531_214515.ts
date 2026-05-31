import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_posts_platform" AS ENUM('linkedin', 'twitter', 'bluesky', 'threads');
  CREATE TYPE "public"."enum_social_posts_status" AS ENUM('draft', 'pending', 'processing', 'published', 'failed', 'cancelled');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'publishSocialPost' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'publishSocialPost' BEFORE 'schedulePublish';
  CREATE TABLE "social_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"linked_post_id" integer,
  	"hero_image_id" integer,
  	"platform" "enum_social_posts_platform" NOT NULL,
  	"status" "enum_social_posts_status" DEFAULT 'draft',
  	"scheduled_for" timestamp(3) with time zone,
  	"published_at" timestamp(3) with time zone,
  	"published_url" varchar,
  	"short_url" varchar,
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "social_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"keywords_id" integer,
  	"media_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "social_posts_id" integer;
  ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_linked_post_id_posts_id_fk" FOREIGN KEY ("linked_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_posts_rels" ADD CONSTRAINT "social_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."social_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_posts_rels" ADD CONSTRAINT "social_posts_rels_keywords_fk" FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_posts_rels" ADD CONSTRAINT "social_posts_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "social_posts_linked_post_idx" ON "social_posts" USING btree ("linked_post_id");
  CREATE INDEX "social_posts_hero_image_idx" ON "social_posts" USING btree ("hero_image_id");
  CREATE INDEX "social_posts_updated_at_idx" ON "social_posts" USING btree ("updated_at");
  CREATE INDEX "social_posts_created_at_idx" ON "social_posts" USING btree ("created_at");
  CREATE INDEX "social_posts_rels_order_idx" ON "social_posts_rels" USING btree ("order");
  CREATE INDEX "social_posts_rels_parent_idx" ON "social_posts_rels" USING btree ("parent_id");
  CREATE INDEX "social_posts_rels_path_idx" ON "social_posts_rels" USING btree ("path");
  CREATE INDEX "social_posts_rels_keywords_id_idx" ON "social_posts_rels" USING btree ("keywords_id");
  CREATE INDEX "social_posts_rels_media_id_idx" ON "social_posts_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_posts_fk" FOREIGN KEY ("social_posts_id") REFERENCES "public"."social_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_social_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("social_posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_posts_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "social_posts" CASCADE;
  DROP TABLE "social_posts_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_social_posts_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'publishScheduledSocialPost', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'publishScheduledSocialPost', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_social_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "social_posts_id";
  DROP TYPE "public"."enum_social_posts_platform";
  DROP TYPE "public"."enum_social_posts_status";`)
}
