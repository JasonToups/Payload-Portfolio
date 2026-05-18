import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "subscribe_post_block" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"description" varchar DEFAULT 'Get updates in your inbox. No spam.',
  	"placeholder" varchar DEFAULT 'Enter your email',
  	"button_text" varchar DEFAULT 'Subscribe',
  	"meta" varchar DEFAULT 'UNSUBSCRIBE WHENEVER',
  	"source" varchar DEFAULT 'post-sidebar',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "subscribe_post_block" CASCADE;`)
}
