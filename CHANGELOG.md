# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0] - 2026-03-22

### Added
- MCP server for the Rootly incident management platform
- Navigation tree with domain-based tool organization (incidents, alerts, schedules, org)
- Full team management — create, get, update, delete
- HTTP transport via StreamableHTTP with session management
- Cloudflare Worker support (experimental) with native fetch client
- Two-layer architecture depending on `@wyre-technology/node-rootly`
- Docker image published to GHCR

### Fixed
- GitHub Packages auth: set `NODE_AUTH_TOKEN` in CI for `npm ci` to resolve scoped package
- Externalize `@wyre-technology/node-rootly` in Node.js tsup build
- Worker build: exclude node-rootly via `esbuildOptions` to avoid bundling Node.js-only code
- HTTP transport: pass `{ isConfigured }` dependency to `createServer()`
- Restore complete `worker.ts` fetch handler (health check, routing, env injection)
