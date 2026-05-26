import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_templates" DROP COLUMN IF EXISTS "is_default";

    ALTER TABLE "email_settings"
      ADD COLUMN IF NOT EXISTS "broadcast_automations_single_post_template_id" integer,
      ADD COLUMN IF NOT EXISTS "broadcast_automations_welcome_email_template_id" integer;

    CREATE INDEX IF NOT EXISTS "email_settings_broadcast_automations_single_post_template_idx"
      ON "email_settings" USING btree ("broadcast_automations_single_post_template_id");
    CREATE INDEX IF NOT EXISTS "email_settings_broadcast_automations_welcome_email_template_idx"
      ON "email_settings" USING btree ("broadcast_automations_welcome_email_template_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "email_settings"
        ADD CONSTRAINT "email_settings_broadcast_automations_single_post_template_id_email_templates_id_fk"
        FOREIGN KEY ("broadcast_automations_single_post_template_id")
        REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "email_settings"
        ADD CONSTRAINT "email_settings_broadcast_automations_welcome_email_template_id_email_templates_id_fk"
        FOREIGN KEY ("broadcast_automations_welcome_email_template_id")
        REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_settings"
      DROP CONSTRAINT IF EXISTS "email_settings_broadcast_automations_single_post_template_id_email_templates_id_fk",
      DROP CONSTRAINT IF EXISTS "email_settings_broadcast_automations_welcome_email_template_id_email_templates_id_fk",
      DROP COLUMN IF EXISTS "broadcast_automations_single_post_template_id",
      DROP COLUMN IF EXISTS "broadcast_automations_welcome_email_template_id";

    ALTER TABLE "email_templates"
      ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false;
  `)
}
