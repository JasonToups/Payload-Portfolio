import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_scheduling_daily_publish_hour" AS ENUM('7', '8', '9', '10', '11', '12', '13', '14', '15');
  ALTER TABLE "site_settings" ADD COLUMN "scheduling_daily_publish_hour" "enum_site_settings_scheduling_daily_publish_hour" DEFAULT '9';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "scheduling_daily_publish_hour";
  DROP TYPE "public"."enum_site_settings_scheduling_daily_publish_hour";`)
}
