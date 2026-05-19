import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "linkedin_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"person_urn" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "email_settings" ALTER COLUMN "from_name" SET DEFAULT 'Jason Toups';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "linkedin_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "linkedin_settings" CASCADE;
  ALTER TABLE "email_settings" ALTER COLUMN "from_name" SET DEFAULT 'Now Hiring';`)
}
