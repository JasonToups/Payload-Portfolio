import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_settings_daily_publish_hour" AS ENUM('7', '8', '9', '10', '11', '12', '13', '14', '15');
  ALTER TYPE "public"."enum_site_settings_socials_profiles_platform" RENAME TO "enum_social_settings_profiles_platform";
  CREATE TABLE "social_settings_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_social_settings_profiles_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "social_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"daily_publish_hour" "enum_social_settings_daily_publish_hour" DEFAULT '9',
  	"linkedin_access_token" varchar,
  	"linkedin_expires_at" timestamp(3) with time zone,
  	"linkedin_person_urn" varchar,
  	"threads_access_token" varchar,
  	"threads_user_id" varchar,
  	"threads_expires_at" timestamp(3) with time zone,
  	"twitter_access_token" varchar,
  	"twitter_refresh_token" varchar,
  	"twitter_expires_at" timestamp(3) with time zone,
  	"twitter_user_id" varchar,
  	"twitter_username" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DROP TABLE "site_settings_socials_profiles" CASCADE;
  DROP TABLE "linkedin_settings" CASCADE;
  DROP TABLE "threads_settings" CASCADE;
  DROP TABLE "bluesky_settings" CASCADE;
  DROP TABLE "twitter_settings" CASCADE;
  ALTER TABLE "social_settings_profiles" ADD CONSTRAINT "social_settings_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "social_settings_profiles_order_idx" ON "social_settings_profiles" USING btree ("_order");
  CREATE INDEX "social_settings_profiles_parent_id_idx" ON "social_settings_profiles" USING btree ("_parent_id");
  ALTER TABLE "site_settings" DROP COLUMN "scheduling_daily_publish_hour";
  DROP TYPE "public"."enum_site_settings_scheduling_daily_publish_hour";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_scheduling_daily_publish_hour" AS ENUM('7', '8', '9', '10', '11', '12', '13', '14', '15');
  ALTER TYPE "public"."enum_social_settings_profiles_platform" RENAME TO "enum_site_settings_socials_profiles_platform";
  CREATE TABLE "linkedin_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"person_urn" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
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
  
  CREATE TABLE "twitter_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar,
  	"refresh_token" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"user_id" varchar,
  	"username" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "social_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "social_settings" CASCADE;
  ALTER TABLE "social_settings_profiles" RENAME TO "site_settings_socials_profiles";
  ALTER TABLE "site_settings_socials_profiles" DROP CONSTRAINT "social_settings_profiles_parent_id_fk";
  
  DROP INDEX "social_settings_profiles_order_idx";
  DROP INDEX "social_settings_profiles_parent_id_idx";
  ALTER TABLE "site_settings" ADD COLUMN "scheduling_daily_publish_hour" "enum_site_settings_scheduling_daily_publish_hour" DEFAULT '9';
  ALTER TABLE "site_settings_socials_profiles" ADD CONSTRAINT "site_settings_socials_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_socials_profiles_order_idx" ON "site_settings_socials_profiles" USING btree ("_order");
  CREATE INDEX "site_settings_socials_profiles_parent_id_idx" ON "site_settings_socials_profiles" USING btree ("_parent_id");
  DROP TYPE "public"."enum_social_settings_daily_publish_hour";`)
}
