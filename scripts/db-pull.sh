#!/usr/bin/env bash
set -euo pipefail

# Prefer PostgreSQL 17 client tools (matches Neon server version)
for pg17 in /opt/homebrew/opt/postgresql@17/bin /usr/local/opt/postgresql@17/bin; do
  [ -d "$pg17" ] && export PATH="$pg17:$PATH" && break
done

# Mirror Next.js env loading: .env first, then .env.local overrides
if [ -f .env ]; then
  set -a; source .env; set +a
fi

# Capture Neon unpooled URL before .env.local can override it
NEON_URL="${DATABASE_URL_UNPOOLED:-}"

if [ -f .env.local ]; then
  set -a; source .env.local; set +a
fi

# After .env.local loads, POSTGRES_URL is the local docker URL
LOCAL_URL="${POSTGRES_URL:-postgresql://postgres:password@localhost:5433/toupsi}"
LOCAL_ADMIN_URL="${LOCAL_URL%/*}/postgres"
DB_NAME="${LOCAL_URL##*/}"
DUMP_FILE="/tmp/neon_dump.dump"

if [ -z "$NEON_URL" ]; then
  echo "Error: DATABASE_URL_UNPOOLED is not set in .env" >&2
  exit 1
fi

echo "→ Starting local postgres..."
docker compose up -d postgres

echo "→ Waiting for postgres to be ready..."
until docker compose exec -T postgres pg_isready -U postgres -q; do sleep 1; done

echo "→ Dumping from Neon (this may take a moment)..."
NEON_DUMP_URL="${NEON_URL}&keepalives=1&keepalives_idle=10&keepalives_interval=5&keepalives_count=5&connect_timeout=30"
pg_dump "$NEON_DUMP_URL" --no-owner --no-acl -Fc -f "$DUMP_FILE"

echo "→ Dropping and recreating local database..."
psql "$LOCAL_ADMIN_URL" \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
  -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" \
  -c "CREATE DATABASE \"$DB_NAME\";"

echo "→ Restoring to local postgres..."
TOC_FILE="/tmp/neon_toc.txt"
pg_restore --list "$DUMP_FILE" | grep -v "pg_session_jwt" > "$TOC_FILE"
pg_restore --no-owner --no-acl --use-list="$TOC_FILE" -d "$LOCAL_URL" "$DUMP_FILE"

echo "✓ db:pull complete — local database is now in sync with Neon."
