# Development

A guide to running this project locally, managing the database, and using the available dev scripts.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- [pnpm](https://pnpm.io/installation) installed
- [PostgreSQL 17](https://www.postgresql.org/) client binaries:
  ```bash
  brew install postgresql@17
  brew link --force libpq
  ```

## Environment Setup

```bash
cp .env.example .env
```

Fill in the following key variables in `.env`:

| Variable                 | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `POSTGRES_URL`           | Local Docker connection string (see below)      |
| `PAYLOAD_SECRET`         | Random secret for JWT signing                   |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` for local dev           |
| `DATABASE_URL_UNPOOLED`  | Neon production URL (needed for `pnpm db:pull`) |

For local development, set `POSTGRES_URL` to:

```
postgresql://postgres:password@127.0.0.1:5433/now-hiring
```

## Running the Project

```bash
pnpm install
pnpm db:local   # start the local Postgres container
pnpm dev        # start the Next.js + Payload dev server
```

Open http://localhost:3000. Follow the on-screen prompt to create your first admin user.

## Local Database

The local database is a PostgreSQL 17 container defined in `docker-compose.yml`, running on port `5433` to avoid conflicts with any system Postgres.

| Detail   | Value            |
| -------- | ---------------- |
| Host     | `127.0.0.1:5433` |
| Database | `now-hiring`     |
| User     | `postgres`       |
| Password | `password`       |

```bash
pnpm db:local          # start the container
docker compose down    # stop the container
```

## Pulling from Neon (Production DB)

`pnpm db:pull` runs `scripts/db-pull.sh` and syncs your local database with the Neon production database.

What it does:

1. Reads `DATABASE_URL_UNPOOLED` from `.env` (your Neon connection string)
2. Starts the local Docker Postgres if it isn't running
3. Dumps the Neon database via `pg_dump`
4. Drops and recreates the local database
5. Restores the dump to your local database

```bash
pnpm db:pull
```

> **Warning:** This overwrites all local data. Your `.env` must contain a valid `DATABASE_URL_UNPOOLED` pointing to Neon.

## Adding a New Data Field

When adding any field that stores data (`text`, `textarea`, `number`, `date`, `select`, `array`, `relationship`, etc.) to a collection or global, follow these steps **in order** before committing.

### Step 1 — Edit the collection config

Add the field to the appropriate file in `src/collections/` or `src/globals/`.

### Step 2 — Start the dev server to sync the local database

```bash
pnpm dev
```

Payload dev mode auto-pushes the schema change (`ALTER TABLE … ADD COLUMN`) directly to your local database. Wait until the server is fully started, then stop it (`Ctrl+C`).

> **Do not run `pnpm migrate` against your local database after this.** The column already exists from the dev-mode push, and the migration will fail with `column already exists`.

### Step 3 — Regenerate TypeScript types

```bash
pnpm generate:types
```

Updates `src/payload-types.ts` so TypeScript code referencing the new field compiles correctly.

### Step 4 — Create the production migration file

```bash
pnpm migrate:create
```

Generates a new `src/migrations/<timestamp>.ts` file with the `ALTER TABLE … ADD COLUMN` SQL. This is what production uses — it does **not** run locally.

### Step 5 — Commit everything together

Stage and commit all of these as one atomic commit:

- The collection/global config change
- `src/payload-types.ts` (regenerated types)
- `src/migrations/<timestamp>.ts` (new migration)
- `src/migrations/<timestamp>.json` (migration snapshot)
- `src/migrations/index.ts` (updated migration registry)

### Step 6 — Push to your feature branch

Production deployment (`pnpm build`) automatically runs `payload migrate` before the Next.js build, applying the migration to the production database.

---

### Why not run `pnpm migrate` locally?

`pnpm dev` (dev-mode push) and `pnpm migrate` are two separate schema-sync mechanisms that conflict when used against the same database:

- **Dev mode push** — immediately applies schema changes to whatever database `POSTGRES_URL` points to; no migration file written.
- **Migrations** — versioned SQL files executed in order; used for production and CI.

After `pnpm dev` runs, your local DB already has the column. Running `pnpm migrate` against the same DB tries to add it again and fails.

`pnpm migrate` is safe to run locally **only** against a clean database that has never had dev mode run against it (e.g., a freshly restored `pnpm db:pull` snapshot). In that case, add `IF NOT EXISTS` to any `ADD COLUMN` statements in the generated migration file first to make it idempotent.

## Pre-PR Checklist

Before opening a pull request, run the appropriate steps below.

### If you added a new field, collection, or global

1. **Dev server** — `pnpm dev` (Payload auto-pushes the schema change to your local database)
2. **Stop** the dev server (`Ctrl+C`)
3. **Regenerate types** — `pnpm generate:types`
4. **Create migration** — `pnpm migrate:create`
5. **Make migration idempotent** — open the generated `src/migrations/<timestamp>.ts` and change any `CREATE TABLE` to `CREATE TABLE IF NOT EXISTS`
6. **Verify the build** — `pnpm build` (Next.js compilation only — migrations run in Vercel, not locally)
7. **Commit** — stage the collection/global config, `payload-types.ts`, and all migration files as one atomic commit

### If you only changed non-schema code

`pnpm build` is sufficient — no migration steps needed.

---

> **How migrations reach production**
>
> `pnpm build` compiles the app only. Migrations run in Vercel via the configured build command:
> ```
> npx payload migrate --force-accept-warning && pnpm build
> ```
> This keeps local builds clean after `pnpm dev` and ensures a bad migration fails the deployment atomically before any code goes live.

---

## Dev Scripts Reference

| Script                    | Description                          |
| ------------------------- | ------------------------------------ |
| `pnpm dev`                | Start the dev server                 |
| `pnpm build`              | Next.js build (migrations run in Vercel, not locally) |
| `pnpm start`              | Serve the production build           |
| `pnpm db:local`           | Start the local Docker Postgres      |
| `pnpm db:pull`            | Sync Neon production DB to local     |
| `pnpm migrate`            | Run pending Payload migrations       |
| `pnpm generate:types`     | Regenerate Payload TypeScript types  |
| `pnpm generate:importmap` | Regenerate Payload import map        |
| `pnpm lint`               | Lint the codebase                    |
| `pnpm lint:fix`           | Lint and auto-fix                    |
| `pnpm test`               | Run all tests                        |
| `pnpm test:int`           | Unit/integration tests only (Vitest) |
| `pnpm test:e2e`           | Playwright E2E tests                 |
| `pnpm reinstall`          | Clean reinstall all dependencies     |
| `pnpm clear:next`         | Delete the `.next` build directory   |
