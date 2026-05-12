# Penpot

Penpot is a self-hosted, open-source design tool that runs alongside this project via Docker. It includes an MCP server so Claude Code can read and manipulate your designs directly.

## Prerequisites

- Docker Desktop running
- `pnpm` installed

## First-time setup

### 1. Start Penpot

```bash
pnpm penpot:up
```

This initializes the `tools/penpot-mcp` submodule (if needed) and starts all Penpot services. The first run takes a few minutes — the MCP service installs and builds its dependencies on startup.

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

```bash
# Start everything
pnpm penpot:up

# Stop everything
pnpm penpot:down
```

After starting, reconnect the plugin in your open design file (step 3 above) — the WebSocket connection does not persist across restarts.

## Updating the MCP server

The MCP server is tracked as a git submodule at `tools/penpot-mcp`. To pull the latest version:

```bash
cd tools/penpot-mcp && git pull
cd ../..
git add tools/penpot-mcp
git commit -m "update penpot-mcp submodule"
```

Then restart with `pnpm penpot:down && pnpm penpot:up`. Docker will rebuild the MCP service on the next start.

## Official MCP documentation

The authoritative reference for the Penpot MCP server is the official Penpot repository:

**https://github.com/penpot/penpot/tree/develop/mcp**

It documents:

- The published npm package (`@penpot/mcp`) — an alternative to the submodule approach used here:
  ```bash
  npx -y @penpot/mcp@latest
  ```
- Environment variable reference (`PENPOT_MCP_SERVER_HOST`, `PENPOT_MCP_PLUGIN_SERVER_HOST`, etc.)
- How to register the server with Claude Code via the CLI:
  ```bash
  claude mcp add penpot -t http http://localhost:4401/mcp
  ```
- `mcp-remote` usage for stdio-based MCP clients:
  ```bash
  npx -y mcp-remote http://localhost:4401/mcp --allow-http
  ```

> **Note:** The submodule at `tools/penpot-mcp` (`penpot/penpot-mcp`) uses slightly different env var names (`PENPOT_MCP_SERVER_LISTEN_ADDRESS` instead of `PENPOT_MCP_SERVER_HOST`). The docker-compose file is already configured for the submodule's env var names.

## Port reference

| Port | Service                                                        |
| ---- | -------------------------------------------------------------- |
| 9001 | Penpot frontend                                                |
| 5434 | Penpot PostgreSQL (separate from the app's PostgreSQL on 5433) |
| 1080 | Mailcatcher web UI                                             |
| 4400 | MCP plugin web server (serves `manifest.json`)                 |
| 4401 | MCP HTTP/SSE endpoint (used by Claude Code)                    |
| 4402 | MCP WebSocket (used by the browser plugin)                     |
