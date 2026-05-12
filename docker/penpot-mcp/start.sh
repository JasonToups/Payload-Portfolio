#!/bin/sh
set -e

npm install
npm run install:all
npm run build:all

exec ./node_modules/.bin/concurrently \
  --names "MCP-SERVER,PLUGIN-SERVER" \
  --prefix-colors "cyan,magenta" \
  --kill-others-on-fail \
  "npm --prefix mcp-server start" \
  "npx --yes serve --cors --no-clipboard -p 4400 penpot-plugin/dist"
