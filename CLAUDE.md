# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

This is a Next.js 15 application built with:

- **Payload CMS** (v3.67.0) - Headless CMS backend
- **TypeScript** - Type safety throughout the codebase
- **React 19** - Component-based frontend framework
- **TailwindCSS** - Utility-first CSS framework with shadcn/ui components
- **PostgreSQL** via Vercel Postgres adapter for database storage

## Development Commands

### Basic Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests (unit and e2e)
pnpm test

# Run unit tests only
pnpm run test:int

# Run e2e tests only
pnpm run test:e2e
```

### Payload-specific Commands

```bash
# Generate TypeScript types from Payload config
pnpm generate:types

# Generate import map for Payload
pnpm generate:importmap

# Run the Payload CLI directly
pnpm payload
```

### Adding a New Data Field — Full Workflow

When adding any field that stores data (type: `text`, `textarea`, `number`, `date`, `select`, `array`, `relationship`, etc.) to a collection or global, follow these steps **in order** before committing.

**Step 1 — Edit the collection config**
Add the field to the appropriate file in `src/collections/` or `src/globals/`.

**Step 2 — Start the dev server to sync the local database**
```bash
pnpm dev
```
Payload dev mode auto-pushes the schema change (e.g. `ALTER TABLE ... ADD COLUMN`) directly to your local database. Wait until the server is fully started, then stop it (`Ctrl+C`).

> Do NOT run `pnpm migrate` against your local database after this step — the column already exists and the migration will fail with "column already exists".

**Step 3 — Regenerate TypeScript types**
```bash
pnpm generate:types
```
This updates `src/payload-types.ts` to include the new field so TypeScript code referencing it compiles correctly.

**Step 4 — Create the production migration file**
```bash
pnpm migrate:create
```
This generates a new `src/migrations/<timestamp>.ts` file with the `ALTER TABLE ... ADD COLUMN` SQL. This file is what production uses — it does **not** run locally.

**Step 5 — Commit everything together**
Stage and commit all four artifacts as a single atomic commit:
- The collection/global config change
- `src/payload-types.ts` (regenerated types)
- `src/migrations/<timestamp>.ts` (new migration file)
- `src/migrations/<timestamp>.json` (migration snapshot)
- `src/migrations/index.ts` (updated migration registry)

**Step 6 — Push to your feature branch**
Production deployment (`pnpm build`) automatically runs `payload migrate` before the Next.js build, applying the migration to the production database.

#### Why not run `pnpm migrate` locally?

`pnpm dev` (dev mode push) and `pnpm migrate` are two separate schema-sync mechanisms. After `pnpm dev` runs, your local DB already has the column. Running `pnpm migrate` against the same DB will fail because the SQL tries to add a column that already exists.

`pnpm migrate` is only useful locally if you are testing a migration against a **clean database** that has never had dev mode run against it. In that case, you may need to add `IF NOT EXISTS` to any `ADD COLUMN` statements in the generated migration file to make it idempotent.

## Key Architecture Components

### Core Structure

1. **`src/`** - Main source code directory:
   - `app/` - Next.js app router files (frontend pages, API routes)
   - `collections/` - Payload CMS collection definitions (Pages, Posts, Media, Categories, Users)
   - `blocks/` - Layout building blocks (Hero, Content, Media, CallToAction, Archive)
   - `components/` - Reusable UI components
   - `Footer/` & `Header/` - Site header and footer configurations
   - `SiteSettings/` - Global site settings configuration
   - `utilities/` - Utility functions for metadata, URL handling, etc.
   - `payload.config.ts` - Main Payload CMS configuration

### Metadata Handling Architecture

This template implements comprehensive SEO and metadata handling:

1. **Global Site Settings**: The `SiteSettings` global configuration includes fields like:
   - `siteName` (used as base for page titles)
   - `siteDescription` (default meta description)
   - `ogImage` (default Open Graph image)

2. **Per-Page Metadata**: Each Page and Post collection can have a `meta` field with:
   - `title` (custom title override)
   - `description` (custom meta description)
   - `image` (custom OG image for the specific page/post)

3. **Dynamic Meta Generation**:
   - The `generateMetadata()` function in `/src/app/(frontend)/[slug]/page.tsx` handles per-page metadata
   - Uses `generateMeta()` utility to create proper title, description, and Open Graph tags
   - Integrates with site settings for default values when page-specific data is missing

4. **Open Graph Integration**:
   - The `mergeOpenGraph()` function combines site defaults with page-specific content
   - Proper handling of image URLs (OG images) through the media collection

### Metadata Generation Flow

- Homepage title uses only the site name
- Other pages use "Site Name | Page Title"
- Fallback to default OG image when no specific image is provided
- Site settings are cached using Next.js `unstable_cache` for performance

## Important Files and Functions

### Metadata Generation
1. **Metadata generation**: `/src/utilities/generateMeta.ts`
2. **Open Graph merging**: `/src/utilities/mergeOpenGraph.ts`
3. **Site settings retrieval**: `/src/utilities/getSiteSettings.ts`

### Post Collection Hooks (`src/collections/Posts/hooks/`)
- **`syncTitleToSlug.ts`**: Auto-generates slug from title on every save; respects manual overrides
- **`validateSlug.ts`**: Validates slug uniqueness against published posts (throws error on duplicate)
- **`syncTitleToMetaTitle.ts`**: Syncs post title + site name to meta.title (cached for 5 min)
- **`syncCategoriesToMetaTitle.ts`**: Appends category names to meta.title
- **`syncContentToMetaDescription.ts`**: Auto-generates meta.description from post content
- **`populateAuthors.ts`**: Fetches user data for authors (privacy protection)
- **`revalidatePost.ts`**: Revalidates cached pages on post changes

### Main Configuration
4. **Main site configuration**: `src/payload.config.ts`
5. **Page metadata handling**: `src/app/(frontend)/[slug]/page.tsx`

The system follows a standard Payload CMS template architecture where:

- Content management happens in the admin panel
- Pages are generated from collections with layout builders
- Metadata is managed both globally (site-wide defaults) and per-document
- Next.js handles static generation with proper meta tags for SEO

## Design System

### Penpot — Single Source of Truth

Penpot is the single source of truth for all redesign work. Components must be implemented **exactly** as designed in Penpot — sizes, colors, spacing, shadows, and typography must match the spec precisely. Do not override or adjust Penpot-specified values based on personal judgement or general guidelines.

If a Penpot spec appears to conflict with an accessibility or code-quality guideline (e.g. a font size below 16px), implement the design as specified and **flag the discrepancy** in the output summary for the designer to address in Penpot. Do not silently change the design.

### Accessibility

The 16px minimum text size and semantic HTML/ARIA requirements are design directives — they are guidelines the designer follows when creating Penpot specs. When implementing a Penpot design, implement the spec exactly; flag any sub-16px text as an accessibility concern for the designer rather than upscaling it in code.

We should always use semantic HTML and ARIA attributes wherever an element's purpose is not self-evident from its HTML tag alone.

### Reusability

We should always favor building reusable components instead of relying only on bespoke solutions.
