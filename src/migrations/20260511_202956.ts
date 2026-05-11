import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

interface DescriptionRow {
  id: number
  description: string
}

interface LexicalTextNode {
  detail: 0
  format: 0
  mode: 'normal'
  style: ''
  text: string
  type: 'text'
  version: 1
}

interface LexicalLinebreakNode {
  type: 'linebreak'
  version: 1
}

interface LexicalParagraphNode {
  children: Array<LexicalTextNode | LexicalLinebreakNode>
  direction: 'ltr'
  format: ''
  indent: 0
  type: 'paragraph'
  version: 1
}

interface LexicalState {
  root: {
    children: LexicalParagraphNode[]
    direction: 'ltr'
    format: ''
    indent: 0
    type: 'root'
    version: 1
  }
}

function textToLexical(text: string): LexicalState {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0)
  const children: LexicalParagraphNode[] = paragraphs.map((paraText) => {
    const lines = paraText.split(/\n/)
    const paraChildren: Array<LexicalTextNode | LexicalLinebreakNode> = []
    lines.forEach((line, i) => {
      if (line) {
        paraChildren.push({
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: line,
          type: 'text',
          version: 1,
        })
      }
      if (i < lines.length - 1) {
        paraChildren.push({ type: 'linebreak', version: 1 })
      }
    })
    return {
      children: paraChildren,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    }
  })
  return {
    root: { children, direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 },
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Preserve existing text values before the type change
  const blockRows = await db.execute(
    sql`SELECT id, description FROM pages_blocks_services WHERE description IS NOT NULL`,
  )
  const servicesRows = await db.execute(
    sql`SELECT id, description FROM pages_blocks_services_services WHERE description IS NOT NULL`,
  )
  const tilesRows = await db.execute(
    sql`SELECT id, description FROM pages_blocks_services_tiles WHERE description IS NOT NULL`,
  )
  const vBlockRows = await db.execute(
    sql`SELECT id, description FROM _pages_v_blocks_services WHERE description IS NOT NULL`,
  )
  const vServicesRows = await db.execute(
    sql`SELECT id, description FROM _pages_v_blocks_services_services WHERE description IS NOT NULL`,
  )
  const vTilesRows = await db.execute(
    sql`SELECT id, description FROM _pages_v_blocks_services_tiles WHERE description IS NOT NULL`,
  )

  // DROP DEFAULT before SET DATA TYPE — PostgreSQL rejects the cast while a varchar default exists
  await db.execute(sql`
    ALTER TABLE "pages_blocks_services" ALTER COLUMN "description" DROP DEFAULT;
    ALTER TABLE "_pages_v_blocks_services" ALTER COLUMN "description" DROP DEFAULT;
  `)

  // Change column types — USING NULL::jsonb because varchar→jsonb has no implicit cast
  await db.execute(sql`
    ALTER TABLE "pages_blocks_services" ALTER COLUMN "description" SET DATA TYPE jsonb USING NULL::jsonb;
    ALTER TABLE "pages_blocks_services_services" ALTER COLUMN "description" SET DATA TYPE jsonb USING NULL::jsonb;
    ALTER TABLE "pages_blocks_services_tiles" ALTER COLUMN "description" SET DATA TYPE jsonb USING NULL::jsonb;
    ALTER TABLE "_pages_v_blocks_services" ALTER COLUMN "description" SET DATA TYPE jsonb USING NULL::jsonb;
    ALTER TABLE "_pages_v_blocks_services_services" ALTER COLUMN "description" SET DATA TYPE jsonb USING NULL::jsonb;
    ALTER TABLE "_pages_v_blocks_services_tiles" ALTER COLUMN "description" SET DATA TYPE jsonb USING NULL::jsonb;
  `)

  // Restore each row as proper Lexical editor JSON
  for (const row of blockRows.rows as unknown as DescriptionRow[]) {
    const lexical = JSON.stringify(textToLexical(row.description))
    await db.execute(
      sql`UPDATE pages_blocks_services SET description = ${lexical}::jsonb WHERE id = ${row.id}`,
    )
  }
  for (const row of servicesRows.rows as unknown as DescriptionRow[]) {
    const lexical = JSON.stringify(textToLexical(row.description))
    await db.execute(
      sql`UPDATE pages_blocks_services_services SET description = ${lexical}::jsonb WHERE id = ${row.id}`,
    )
  }
  for (const row of tilesRows.rows as unknown as DescriptionRow[]) {
    const lexical = JSON.stringify(textToLexical(row.description))
    await db.execute(
      sql`UPDATE pages_blocks_services_tiles SET description = ${lexical}::jsonb WHERE id = ${row.id}`,
    )
  }
  for (const row of vBlockRows.rows as unknown as DescriptionRow[]) {
    const lexical = JSON.stringify(textToLexical(row.description))
    await db.execute(
      sql`UPDATE _pages_v_blocks_services SET description = ${lexical}::jsonb WHERE id = ${row.id}`,
    )
  }
  for (const row of vServicesRows.rows as unknown as DescriptionRow[]) {
    const lexical = JSON.stringify(textToLexical(row.description))
    await db.execute(
      sql`UPDATE _pages_v_blocks_services_services SET description = ${lexical}::jsonb WHERE id = ${row.id}`,
    )
  }
  for (const row of vTilesRows.rows as unknown as DescriptionRow[]) {
    const lexical = JSON.stringify(textToLexical(row.description))
    await db.execute(
      sql`UPDATE _pages_v_blocks_services_tiles SET description = ${lexical}::jsonb WHERE id = ${row.id}`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_services" ALTER COLUMN "description" SET DATA TYPE varchar USING NULL::varchar;
    ALTER TABLE "pages_blocks_services" ALTER COLUMN "description" SET DEFAULT 'Problems I solve and the teams I work best with.';
    ALTER TABLE "pages_blocks_services_services" ALTER COLUMN "description" SET DATA TYPE varchar USING NULL::varchar;
    ALTER TABLE "pages_blocks_services_tiles" ALTER COLUMN "description" SET DATA TYPE varchar USING NULL::varchar;
    ALTER TABLE "_pages_v_blocks_services" ALTER COLUMN "description" SET DATA TYPE varchar USING NULL::varchar;
    ALTER TABLE "_pages_v_blocks_services" ALTER COLUMN "description" SET DEFAULT 'Problems I solve and the teams I work best with.';
    ALTER TABLE "_pages_v_blocks_services_services" ALTER COLUMN "description" SET DATA TYPE varchar USING NULL::varchar;
    ALTER TABLE "_pages_v_blocks_services_tiles" ALTER COLUMN "description" SET DATA TYPE varchar USING NULL::varchar;
  `)
}
