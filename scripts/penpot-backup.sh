#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DEST="backups/penpot/$TIMESTAMP"
mkdir -p "$DEST"

echo "→ Backing up Penpot database..."
docker compose -f docker-compose.penpot.yml -p penpot \
  exec -T penpot-postgres \
  pg_dump -U penpot penpot > "$DEST/penpot.sql"

echo "→ Backing up Penpot assets..."
docker run --rm \
  -v penpot_penpot_assets:/data \
  -v "$(pwd)/$DEST":/backup \
  alpine tar czf /backup/assets.tar.gz -C /data .

echo "✓ Backup saved to $DEST"
echo "  - $DEST/penpot.sql    (database)"
echo "  - $DEST/assets.tar.gz (uploaded images/media)"
