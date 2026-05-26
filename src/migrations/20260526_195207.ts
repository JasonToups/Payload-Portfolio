import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1 — Create the email_templates table
  await db.execute(sql`
    CREATE TYPE IF NOT EXISTS "public"."enum_email_templates_template_type" AS ENUM(
      'single_post', 'weekly_digest', 'category_digest', 'keyword_digest', 'welcome_email', 'custom'
    );

    CREATE TABLE IF NOT EXISTS "email_templates" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "template_type" "enum_email_templates_template_type" NOT NULL,
      "is_default" boolean DEFAULT false,
      "header_layout_logo_id" integer,
      "header_layout_tagline" varchar,
      "header_layout_bg_color" varchar,
      "header_layout_text_color" varchar,
      "auto_pull_auto_pull_enabled" boolean DEFAULT false,
      "auto_pull_category_source_id" integer,
      "auto_pull_keyword_source_id" integer,
      "auto_pull_auto_pull_count" numeric DEFAULT 3,
      "audience_targeting_audience_topic_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "email_templates_header_layout_logo_idx"
      ON "email_templates" USING btree ("header_layout_logo_id");
    CREATE INDEX IF NOT EXISTS "email_templates_auto_pull_category_source_idx"
      ON "email_templates" USING btree ("auto_pull_category_source_id");
    CREATE INDEX IF NOT EXISTS "email_templates_auto_pull_keyword_source_idx"
      ON "email_templates" USING btree ("auto_pull_keyword_source_id");
    CREATE INDEX IF NOT EXISTS "email_templates_audience_targeting_audience_topic_idx"
      ON "email_templates" USING btree ("audience_targeting_audience_topic_id");
    CREATE INDEX IF NOT EXISTS "email_templates_updated_at_idx"
      ON "email_templates" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "email_templates_created_at_idx"
      ON "email_templates" USING btree ("created_at");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "email_templates"
        ADD CONSTRAINT "email_templates_header_layout_logo_id_media_id_fk"
        FOREIGN KEY ("header_layout_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "email_templates"
        ADD CONSTRAINT "email_templates_auto_pull_category_source_id_categories_id_fk"
        FOREIGN KEY ("auto_pull_category_source_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "email_templates"
        ADD CONSTRAINT "email_templates_auto_pull_keyword_source_id_keywords_id_fk"
        FOREIGN KEY ("auto_pull_keyword_source_id") REFERENCES "public"."keywords"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "email_templates"
        ADD CONSTRAINT "email_templates_audience_targeting_audience_topic_id_categories_id_fk"
        FOREIGN KEY ("audience_targeting_audience_topic_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)

  // Step 2 — Add email_templates_id to payload_locked_documents_rels
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "email_templates_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_email_templates_id_idx"
      ON "payload_locked_documents_rels" USING btree ("email_templates_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_email_templates_fk"
        FOREIGN KEY ("email_templates_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)

  // Step 3 — Add template_id (nullable) and template_type columns to broadcasts tables
  await db.execute(sql`
    ALTER TABLE "broadcasts"
      ADD COLUMN IF NOT EXISTS "template_id" integer,
      ADD COLUMN IF NOT EXISTS "template_type" varchar;

    ALTER TABLE "_broadcasts_v"
      ADD COLUMN IF NOT EXISTS "version_template_id" integer,
      ADD COLUMN IF NOT EXISTS "version_template_type" varchar;
  `)

  // Step 4 — Seed default Email Templates via Payload API and migrate existing broadcasts
  const singlePostTemplate = await payload.create({
    collection: 'email-templates',
    data: { name: 'Single Post', templateType: 'single_post' },
    overrideAccess: true,
  })

  const weeklyDigestTemplate = await payload.create({
    collection: 'email-templates',
    data: {
      name: 'Weekly Digest',
      templateType: 'weekly_digest',
      autoPull: { autoPullEnabled: true },
    },
    overrideAccess: true,
  })

  const customTemplate = await payload.create({
    collection: 'email-templates',
    data: { name: 'Custom', templateType: 'custom' },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'email-templates',
    data: { name: 'Welcome Email', templateType: 'welcome_email' },
    overrideAccess: true,
  })

  const spId = singlePostTemplate.id
  const wdId = weeklyDigestTemplate.id
  const cuId = customTemplate.id

  // Map old type values to the seeded template IDs
  await db.execute(sql`
    UPDATE "broadcasts" SET "template_id" = ${spId}, "template_type" = 'single_post'
      WHERE "type" = 'single_post';
    UPDATE "broadcasts" SET "template_id" = ${wdId}, "template_type" = 'weekly_digest'
      WHERE "type" = 'weekly_digest';
    UPDATE "broadcasts" SET "template_id" = ${cuId}, "template_type" = 'custom'
      WHERE "type" = 'custom' OR "type" IS NULL OR "template_id" IS NULL;

    UPDATE "_broadcasts_v" SET "version_template_id" = ${spId}, "version_template_type" = 'single_post'
      WHERE "version_type" = 'single_post';
    UPDATE "_broadcasts_v" SET "version_template_id" = ${wdId}, "version_template_type" = 'weekly_digest'
      WHERE "version_type" = 'weekly_digest';
    UPDATE "_broadcasts_v" SET "version_template_id" = ${cuId}, "version_template_type" = 'custom'
      WHERE "version_type" = 'custom' OR "version_type" IS NULL OR "version_template_id" IS NULL;
  `)

  // Step 5 — Add FK indexes and constraints for template_id
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "broadcasts_template_idx"
      ON "broadcasts" USING btree ("template_id");
    CREATE INDEX IF NOT EXISTS "_broadcasts_v_version_template_idx"
      ON "_broadcasts_v" USING btree ("version_template_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "broadcasts"
        ADD CONSTRAINT "broadcasts_template_id_email_templates_id_fk"
        FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_broadcasts_v"
        ADD CONSTRAINT "_broadcasts_v_version_template_id_email_templates_id_fk"
        FOREIGN KEY ("version_template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)

  // Step 6 — Drop old type and audience_topic columns from broadcasts
  await db.execute(sql`
    DROP INDEX IF EXISTS "broadcasts_audience_topic_idx";
    DROP INDEX IF EXISTS "_broadcasts_v_version_version_audience_topic_idx";

    ALTER TABLE "broadcasts"
      DROP CONSTRAINT IF EXISTS "broadcasts_audience_topic_id_categories_id_fk",
      DROP COLUMN IF EXISTS "audience_topic_id",
      DROP COLUMN IF EXISTS "type";

    ALTER TABLE "_broadcasts_v"
      DROP CONSTRAINT IF EXISTS "_broadcasts_v_version_audience_topic_id_categories_id_fk",
      DROP COLUMN IF EXISTS "version_audience_topic_id",
      DROP COLUMN IF EXISTS "version_type";

    DROP TYPE IF EXISTS "public"."enum_broadcasts_type";
    DROP TYPE IF EXISTS "public"."enum__broadcasts_v_version_type";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_broadcasts_type" AS ENUM('single_post', 'weekly_digest', 'custom');
    CREATE TYPE "public"."enum__broadcasts_v_version_type" AS ENUM('single_post', 'weekly_digest', 'custom');

    ALTER TABLE "broadcasts"
      ADD COLUMN IF NOT EXISTS "audience_topic_id" integer,
      ADD COLUMN IF NOT EXISTS "type" "enum_broadcasts_type" DEFAULT 'custom';
    ALTER TABLE "_broadcasts_v"
      ADD COLUMN IF NOT EXISTS "version_audience_topic_id" integer,
      ADD COLUMN IF NOT EXISTS "version_type" "enum__broadcasts_v_version_type" DEFAULT 'custom';

    UPDATE "broadcasts" b
      SET "type" = t."template_type"::text::"enum_broadcasts_type"
      FROM "email_templates" t WHERE b."template_id" = t."id"
      AND t."template_type" IN ('single_post', 'weekly_digest', 'custom');

    ALTER TABLE "broadcasts"
      DROP CONSTRAINT IF EXISTS "broadcasts_template_id_email_templates_id_fk",
      DROP COLUMN IF EXISTS "template_id",
      DROP COLUMN IF EXISTS "template_type";
    ALTER TABLE "_broadcasts_v"
      DROP CONSTRAINT IF EXISTS "_broadcasts_v_version_template_id_email_templates_id_fk",
      DROP COLUMN IF EXISTS "version_template_id",
      DROP COLUMN IF EXISTS "version_template_type";

    CREATE INDEX IF NOT EXISTS "broadcasts_audience_topic_idx"
      ON "broadcasts" USING btree ("audience_topic_id");
    CREATE INDEX IF NOT EXISTS "_broadcasts_v_version_version_audience_topic_idx"
      ON "_broadcasts_v" USING btree ("version_audience_topic_id");

    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_email_templates_fk",
      DROP COLUMN IF EXISTS "email_templates_id";

    ALTER TABLE "email_templates" DISABLE ROW LEVEL SECURITY;
    DROP TABLE IF EXISTS "email_templates" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_email_templates_template_type";
  `)
}
