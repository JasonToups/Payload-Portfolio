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

| Variable | Description |
| -------- | ----------- |
| `POSTGRES_URL` | Local Docker connection string (see below) |
| `PAYLOAD_SECRET` | Random secret for JWT signing |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` for local dev |
| `DATABASE_URL_UNPOOLED` | Neon production URL (needed for `pnpm db:pull`) |

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

| Detail | Value |
| ------ | ----- |
| Host | `127.0.0.1:5433` |
| Database | `now-hiring` |
| User | `postgres` |
| Password | `password` |

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

## Database Migrations

Payload tracks schema changes as migration files. After pulling from Neon or making collection changes, run:

```bash
pnpm migrate
```

To create a new migration after changing a collection or field:

```bash
pnpm payload migrate:create
```

Commit the generated migration file alongside your config changes.

## Dev Scripts Reference

| Script | Description |
| ------ | ----------- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm db:local` | Start the local Docker Postgres |
| `pnpm db:pull` | Sync Neon production DB to local |
| `pnpm migrate` | Run pending Payload migrations |
| `pnpm generate:types` | Regenerate Payload TypeScript types |
| `pnpm generate:importmap` | Regenerate Payload import map |
| `pnpm lint` | Lint the codebase |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm test` | Run all tests |
| `pnpm test:int` | Unit/integration tests only (Vitest) |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm reinstall` | Clean reinstall all dependencies |
| `pnpm clear:next` | Delete the `.next` build directory |
