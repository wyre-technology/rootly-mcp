## [1.0.2](https://github.com/wyre-technology/rootly-mcp/compare/v1.0.1...v1.0.2) (2026-04-06)


### Bug Fixes

* **ci:** fix node -p shell quoting in release workflow ([b215ced](https://github.com/wyre-technology/rootly-mcp/commit/b215ced6f1f322d5cb9b4c9d49eda183a3aaf574))

## [1.0.1](https://github.com/wyre-technology/rootly-mcp/compare/v1.0.0...v1.0.1) (2026-04-06)


### Bug Fixes

* **ci:** add missing semantic-release plugin dependencies ([011fe5e](https://github.com/wyre-technology/rootly-mcp/commit/011fe5e899abdc747852a4b3abfd9dc842c471dd))
* **ci:** add NODE_AUTH_TOKEN for GitHub Packages auth in all jobs ([55d39b7](https://github.com/wyre-technology/rootly-mcp/commit/55d39b70e710bd24151d9d201376140fd95c8534))
* **ci:** Configure GitHub Packages auth for release workflow ([5c0224c](https://github.com/wyre-technology/rootly-mcp/commit/5c0224c330131f5c00f674606a9fb0c3ba3fb348))
* **deploy:** replace node_compat with nodejs_compat for Wrangler v4 ([e97b629](https://github.com/wyre-technology/rootly-mcp/commit/e97b62989bf808d37a3e05da45c6492f210b6f9d))

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
