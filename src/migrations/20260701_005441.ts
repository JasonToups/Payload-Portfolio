import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_social_settings_profiles_platform" ADD VALUE 'facebook';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "social_settings_profiles" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_social_settings_profiles_platform";
  CREATE TYPE "public"."enum_social_settings_profiles_platform" AS ENUM('twitter', 'threads', 'bluesky', 'linkedin');
  ALTER TABLE "social_settings_profiles" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_social_settings_profiles_platform" USING "platform"::"public"."enum_social_settings_profiles_platform";`)
}
