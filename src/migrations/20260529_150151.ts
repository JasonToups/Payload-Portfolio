import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "short_urls" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"target_url" varchar NOT NULL,
  	"post_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "scheduled_social_posts" ADD COLUMN "short_url" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "short_urls_id" integer;
  ALTER TABLE "short_urls" ADD CONSTRAINT "short_urls_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "short_urls_code_idx" ON "short_urls" USING btree ("code");
  CREATE INDEX "short_urls_post_idx" ON "short_urls" USING btree ("post_id");
  CREATE INDEX "short_urls_updated_at_idx" ON "short_urls" USING btree ("updated_at");
  CREATE INDEX "short_urls_created_at_idx" ON "short_urls" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_short_urls_fk" FOREIGN KEY ("short_urls_id") REFERENCES "public"."short_urls"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_short_urls_id_idx" ON "payload_locked_documents_rels" USING btree ("short_urls_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "short_urls" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "short_urls" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_short_urls_fk";
  
  DROP INDEX "payload_locked_documents_rels_short_urls_id_idx";
  ALTER TABLE "scheduled_social_posts" DROP COLUMN "short_url";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "short_urls_id";`)
}
