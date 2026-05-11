import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

interface ManifestoPageRow {
  id: number
  hero_manifesto: string
}

interface ManifestoPageVersionRow {
  id: number
  version_hero_manifesto: string
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
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
  const children: LexicalParagraphNode[] = paragraphs.map(paraText => {
    const lines = paraText.split(/\n/)
    const paraChildren: Array<LexicalTextNode | LexicalLinebreakNode> = []
    lines.forEach((line, i) => {
      if (line) {
        paraChildren.push({ detail: 0, format: 0, mode: 'normal', style: '', text: line, type: 'text', version: 1 })
      }
      if (i < lines.length - 1) {
        paraChildren.push({ type: 'linebreak', version: 1 })
      }
    })
    return { children: paraChildren, direction: 'ltr', format: '', indent: 0, type: 'paragraph', version: 1 }
  })
  return { root: { children, direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Read existing text values before the type change
  const pagesResult = await db.execute(sql`
    SELECT id, hero_manifesto FROM pages WHERE hero_manifesto IS NOT NULL
  `)
  const versionsResult = await db.execute(sql`
    SELECT id, version_hero_manifesto FROM _pages_v WHERE version_hero_manifesto IS NOT NULL
  `)

  // Change column type — USING NULL::jsonb safely nulls existing values during cast
  // (implicit varchar→jsonb cast is not supported in PostgreSQL)
  await db.execute(sql`ALTER TABLE "pages" ALTER COLUMN "hero_manifesto" TYPE jsonb USING NULL::jsonb`)
  await db.execute(sql`ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_manifesto" TYPE jsonb USING NULL::jsonb`)

  // Restore each row as proper Lexical editor JSON
  for (const row of pagesResult.rows as unknown as ManifestoPageRow[]) {
    const lexical = JSON.stringify(textToLexical(row.hero_manifesto))
    await db.execute(sql`UPDATE pages SET hero_manifesto = ${lexical}::jsonb WHERE id = ${row.id}`)
  }
  for (const row of versionsResult.rows as unknown as ManifestoPageVersionRow[]) {
    const lexical = JSON.stringify(textToLexical(row.version_hero_manifesto))
    await db.execute(sql`UPDATE _pages_v SET version_hero_manifesto = ${lexical}::jsonb WHERE id = ${row.id}`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "pages" ALTER COLUMN "hero_manifesto" TYPE varchar USING NULL::varchar`)
  await db.execute(sql`ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_manifesto" TYPE varchar USING NULL::varchar`)
}
