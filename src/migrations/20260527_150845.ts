import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_templates" ADD COLUMN IF NOT EXISTS "body" jsonb
  `)
  await db.execute(sql`
    ALTER TABLE "email_settings" RENAME COLUMN "welcome_email_enabled" TO "broadcast_automations_welcome_email_enabled"
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_settings" RENAME COLUMN "broadcast_automations_welcome_email_enabled" TO "welcome_email_enabled"
  `)
  await db.execute(sql`
    ALTER TABLE "email_templates" DROP COLUMN IF EXISTS "body"
  `)
}
