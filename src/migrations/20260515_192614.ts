import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_services_tiles_cta_button_icon" AS ENUM('none', 'arrow-right', 'arrow-up-right', 'chevron-right', 'external-link', 'send', 'mail', 'download', 'plus', 'check');
  CREATE TYPE "public"."enum_pages_blocks_subscribe_button_icon" AS ENUM('none', 'arrow-right', 'arrow-up-right', 'chevron-right', 'external-link', 'send', 'mail', 'download', 'plus', 'check');
  CREATE TYPE "public"."enum_pages_blocks_subscribe_button_variant" AS ENUM('default', 'large', 'secondary', 'large-secondary', 'animated', 'destructive', 'ghost', 'link', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_services_tiles_cta_button_icon" AS ENUM('none', 'arrow-right', 'arrow-up-right', 'chevron-right', 'external-link', 'send', 'mail', 'download', 'plus', 'check');
  CREATE TYPE "public"."enum__pages_v_blocks_subscribe_button_icon" AS ENUM('none', 'arrow-right', 'arrow-up-right', 'chevron-right', 'external-link', 'send', 'mail', 'download', 'plus', 'check');
  CREATE TYPE "public"."enum__pages_v_blocks_subscribe_button_variant" AS ENUM('default', 'large', 'secondary', 'large-secondary', 'animated', 'destructive', 'ghost', 'link', 'outline');
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'large' BEFORE 'outline';
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'animated' BEFORE 'outline';
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'link';
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'destructive';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'large' BEFORE 'outline';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'animated' BEFORE 'outline';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'link';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'destructive';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'large' BEFORE 'outline';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'animated' BEFORE 'outline';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'link';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'destructive';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'large' BEFORE 'outline';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'animated' BEFORE 'outline';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'link';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'destructive';
  ALTER TABLE "pages_blocks_services_tiles" ADD COLUMN "cta_button_icon" "enum_pages_blocks_services_tiles_cta_button_icon" DEFAULT 'arrow-right';
  ALTER TABLE "pages_blocks_services_tiles" ADD COLUMN "cta_button_new_tab" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_subscribe" ADD COLUMN "button_icon" "enum_pages_blocks_subscribe_button_icon" DEFAULT 'none';
  ALTER TABLE "pages_blocks_subscribe" ADD COLUMN "button_variant" "enum_pages_blocks_subscribe_button_variant" DEFAULT 'large';
  ALTER TABLE "_pages_v_blocks_services_tiles" ADD COLUMN "cta_button_icon" "enum__pages_v_blocks_services_tiles_cta_button_icon" DEFAULT 'arrow-right';
  ALTER TABLE "_pages_v_blocks_services_tiles" ADD COLUMN "cta_button_new_tab" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_subscribe" ADD COLUMN "button_icon" "enum__pages_v_blocks_subscribe_button_icon" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_subscribe" ADD COLUMN "button_variant" "enum__pages_v_blocks_subscribe_button_variant" DEFAULT 'large';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_links" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum_pages_hero_links_link_appearance";
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum_pages_hero_links_link_appearance" USING "link_appearance"::"public"."enum_pages_hero_links_link_appearance";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum_pages_blocks_content_columns_link_appearance";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum_pages_blocks_content_columns_link_appearance" USING "link_appearance"::"public"."enum_pages_blocks_content_columns_link_appearance";
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum__pages_v_version_hero_links_link_appearance";
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum__pages_v_version_hero_links_link_appearance" USING "link_appearance"::"public"."enum__pages_v_version_hero_links_link_appearance";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum__pages_v_blocks_content_columns_link_appearance";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" USING "link_appearance"::"public"."enum__pages_v_blocks_content_columns_link_appearance";
  ALTER TABLE "pages_blocks_services_tiles" DROP COLUMN "cta_button_icon";
  ALTER TABLE "pages_blocks_services_tiles" DROP COLUMN "cta_button_new_tab";
  ALTER TABLE "pages_blocks_subscribe" DROP COLUMN "button_icon";
  ALTER TABLE "pages_blocks_subscribe" DROP COLUMN "button_variant";
  ALTER TABLE "_pages_v_blocks_services_tiles" DROP COLUMN "cta_button_icon";
  ALTER TABLE "_pages_v_blocks_services_tiles" DROP COLUMN "cta_button_new_tab";
  ALTER TABLE "_pages_v_blocks_subscribe" DROP COLUMN "button_icon";
  ALTER TABLE "_pages_v_blocks_subscribe" DROP COLUMN "button_variant";
  DROP TYPE "public"."enum_pages_blocks_services_tiles_cta_button_icon";
  DROP TYPE "public"."enum_pages_blocks_subscribe_button_icon";
  DROP TYPE "public"."enum_pages_blocks_subscribe_button_variant";
  DROP TYPE "public"."enum__pages_v_blocks_services_tiles_cta_button_icon";
  DROP TYPE "public"."enum__pages_v_blocks_subscribe_button_icon";
  DROP TYPE "public"."enum__pages_v_blocks_subscribe_button_variant";`)
}
