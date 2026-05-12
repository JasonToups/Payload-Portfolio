# Penpot

Penpot is a self-hosted, open-source design tool that runs alongside this project via Docker. It includes an MCP server so Claude Code can read and manipulate your designs directly.

The MCP server is the official [`@penpot/mcp`](https://github.com/penpot/penpot/tree/develop/mcp) package, integrated into the main Penpot repository as of v2.15.0.

## Prerequisites

- Docker Desktop running
- `pnpm` installed

## First-time setup

### 0. Install Penpot MCP Server

```shell
npx @penpot/mcp@stable
```

### 1. Start Penpot Docker

```bash
pnpm penpot:up
```

This starts all Penpot services. On the first run, the MCP container downloads the `@penpot/mcp` package (~seconds) and caches it in a Docker volume for subsequent starts.

Services started:

| Service                     | URL                   |
| --------------------------- | --------------------- |
| Penpot app                  | http://localhost:9001 |
| Mailcatcher (email preview) | http://localhost:1080 |
| MCP server                  | http://localhost:4401 |

### 2. Create your account

Because email verification is disabled in local dev, you can register directly at http://localhost:9001. Fill in any email address and password — no confirmation email is required.

### 3. Connect the MCP plugin

Penpot has a built-in plugin system (separate from any browser extension). The MCP bridge runs as a plugin inside the Penpot web app and relays commands between Claude Code and your open design file.

1. Open http://localhost:9001 and sign in
2. Create or open any design file — plugins are only available inside a file, not on the dashboard
3. In the Penpot toolbar at the top of the editor, click the **puzzle-piece icon** (far right of the toolbar)
4. Click **Add plugin**
5. Paste this URL and confirm:
   ```
   http://localhost:4400/manifest.json
   ```
6. The **Penpot MCP** plugin will appear in your plugin list — open it
7. Click **Connect to MCP server**

The plugin panel must stay open while you use Claude Code — closing it disconnects the bridge.

### 4. Verify Claude Code can see Penpot

In Claude Code, run:

```
/mcp
```

You should see `penpot` listed as a connected server. You can now ask Claude to list projects, inspect layers, create shapes, and more.

## Day-to-day usage

### Start Penpot Container

```shell
pnpm penpot:up
```

### Run the Penpot MCP Server

```shell
npx @penpot/mcp@stable
```

### Stop Penpot Container

```shell
pnpm penpot:down
```

After starting, reconnect the plugin in your open design file (step 3 above) — the WebSocket connection does not persist across restarts.

## Updating the MCP server

The MCP server version is controlled by the `command` in `docker-compose.penpot.yml`:

```yaml
command: npx -y @penpot/mcp@latest
```

`@latest` always pulls the current stable release. To pin to a specific version, replace `@latest` with a version tag (e.g. `@2.15.0`). After changing the version, restart with `pnpm penpot:down && pnpm penpot:up` — Docker will fetch the new version on the next start.

## Official documentation

- MCP server source and full env var reference: https://github.com/penpot/penpot/tree/develop/mcp
- Claude Code CLI registration: `claude mcp add penpot -t http http://localhost:4401/mcp`
- For stdio-based MCP clients: `npx -y mcp-remote http://localhost:4401/mcp --allow-http`

## Data & Backups

Penpot data lives in two Docker volumes that **persist across `pnpm penpot:down` / `pnpm penpot:up` cycles**. Designs are only lost if you explicitly run `docker compose down -v` or purge volumes from Docker Desktop.

### Taking a backup

With the stack running:

```bash
pnpm penpot:backup
```

Creates `backups/penpot/YYYYMMDD-HHMMSS/` with:

- `penpot.sql` — full database dump (projects, files, shapes)
- `assets.tar.gz` — uploaded images and media

The `backups/` directory is gitignored.

### Restoring

With the stack running, replace `<timestamp>` with the folder name (e.g. `20260512-143000`):

```bash
# 1. Drop and recreate the database (clears existing data)
docker compose -f docker-compose.penpot.yml -p penpot exec -T penpot-postgres \
  psql -U penpot -d postgres \
  -c "DROP DATABASE penpot;" \
  -c "CREATE DATABASE penpot;"

# 2. Restore the database
docker compose -f docker-compose.penpot.yml -p penpot exec -T penpot-postgres \
  psql -U penpot penpot < backups/penpot/<timestamp>/penpot.sql

# 3. Restore assets (clears existing, then extracts)
docker run --rm \
  -v penpot_penpot_assets:/data \
  -v "$(pwd)/backups/penpot/<timestamp>":/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/assets.tar.gz -C /data"

# 4. Restart so the backend picks up the restored state
pnpm penpot:down && pnpm penpot:up
```

## Port reference

| Port | Service                                                        |
| ---- | -------------------------------------------------------------- |
| 9001 | Penpot frontend                                                |
| 5434 | Penpot PostgreSQL (separate from the app's PostgreSQL on 5433) |
| 1080 | Mailcatcher web UI                                             |
| 4400 | MCP plugin web server (serves `manifest.json`)                 |
| 4401 | MCP HTTP/SSE endpoint (used by Claude Code)                    |
| 4402 | MCP WebSocket (used by the browser plugin)                     |
