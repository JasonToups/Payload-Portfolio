import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
    CREATE TYPE "public"."enum_posts_social_shares_platform" AS ENUM('twitter', 'threads', 'bluesky', 'linkedin');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__posts_v_version_social_shares_platform" AS ENUM('twitter', 'threads', 'bluesky', 'linkedin');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_socials_profiles_platform" AS ENUM('twitter', 'threads', 'bluesky', 'linkedin');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE TABLE IF NOT EXISTS "posts_social_shares" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_posts_social_shares_platform",
  	"shared_at" timestamp(3) with time zone,
  	"share_url" varchar
  );

  CREATE TABLE IF NOT EXISTS "_posts_v_version_social_shares" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__posts_v_version_social_shares_platform",
  	"shared_at" timestamp(3) with time zone,
  	"share_url" varchar,
  	"_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "site_settings_socials_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_socials_profiles_platform" NOT NULL,
  	"url" varchar NOT NULL
  );

  DO $$ BEGIN
    ALTER TABLE "posts_social_shares" ADD CONSTRAINT "posts_social_shares_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "_posts_v_version_social_shares" ADD CONSTRAINT "_posts_v_version_social_shares_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "site_settings_socials_profiles" ADD CONSTRAINT "site_settings_socials_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "posts_social_shares_order_idx" ON "posts_social_shares" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_social_shares_parent_id_idx" ON "posts_social_shares" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_social_shares_order_idx" ON "_posts_v_version_social_shares" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_social_shares_parent_id_idx" ON "_posts_v_version_social_shares" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "site_settings_socials_profiles_order_idx" ON "site_settings_socials_profiles" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "site_settings_socials_profiles_parent_id_idx" ON "site_settings_socials_profiles" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts_social_shares" CASCADE;
  DROP TABLE "_posts_v_version_social_shares" CASCADE;
  DROP TABLE "site_settings_socials_profiles" CASCADE;
  DROP TYPE "public"."enum_posts_social_shares_platform";
  DROP TYPE "public"."enum__posts_v_version_social_shares_platform";
  DROP TYPE "public"."enum_site_settings_socials_profiles_platform";`)
}
