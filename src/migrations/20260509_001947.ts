import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_resumes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resumes_v_version_status" AS ENUM('draft', 'published');

  CREATE TABLE "resumes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"author" varchar,
  	"content" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_resumes_status" DEFAULT 'draft'
  );

  CREATE TABLE "_resumes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_author" varchar,
  	"version_content" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__resumes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "resumes_id" integer;

  ALTER TABLE "_resumes_v" ADD CONSTRAINT "_resumes_v_parent_id_resumes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resumes_fk" FOREIGN KEY ("resumes_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "resumes_updated_at_idx" ON "resumes" USING btree ("updated_at");
  CREATE INDEX "resumes_created_at_idx" ON "resumes" USING btree ("created_at");
  CREATE INDEX "resumes__status_idx" ON "resumes" USING btree ("_status");
  CREATE INDEX "_resumes_v_parent_idx" ON "_resumes_v" USING btree ("parent_id");
  CREATE INDEX "_resumes_v_version_version_updated_at_idx" ON "_resumes_v" USING btree ("version_updated_at");
  CREATE INDEX "_resumes_v_version_version_created_at_idx" ON "_resumes_v" USING btree ("version_created_at");
  CREATE INDEX "_resumes_v_version_version__status_idx" ON "_resumes_v" USING btree ("version__status");
  CREATE INDEX "_resumes_v_created_at_idx" ON "_resumes_v" USING btree ("created_at");
  CREATE INDEX "_resumes_v_updated_at_idx" ON "_resumes_v" USING btree ("updated_at");
  CREATE INDEX "_resumes_v_latest_idx" ON "_resumes_v" USING btree ("latest");
  CREATE INDEX "payload_locked_documents_rels_resumes_id_idx" ON "payload_locked_documents_rels" USING btree ("resumes_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "_resumes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resumes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_resumes_v" CASCADE;
  DROP TABLE "resumes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_resumes_fk";
  DROP INDEX "payload_locked_documents_rels_resumes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "resumes_id";
  DROP TYPE "public"."enum_resumes_status";
  DROP TYPE "public"."enum__resumes_v_version_status";
  `)
}
