import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_settings_timezone" AS ENUM('America/Los_Angeles', 'America/Denver', 'America/Phoenix', 'America/Chicago', 'America/New_York', 'America/Anchorage', 'Pacific/Honolulu');
  ALTER TABLE "social_settings" ADD COLUMN "timezone" "enum_social_settings_timezone" DEFAULT 'America/Chicago' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_settings" DROP COLUMN "timezone";
  DROP TYPE "public"."enum_social_settings_timezone";`)
}
