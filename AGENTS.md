# template-hono-spa Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-09

## Active Technologies
- TypeScript (ESM), Node.js runtime + Hono, Preact, Vite, Cloudflare Workers integration libraries (002-remove-ssr)
- Filesystem assets for static files and build outputs (002-remove-ssr)
- TypeScript (ESM), Node.js runtime + Preact, route-event-style client routing dependencies, Hono, Cloudflare Worker tooling, Vite (003-client-side-routing)
- Filesystem static assets and generated build outpu (003-client-side-routing)
- TypeScript (ESM), Node.js runtime + Preact, @preact/signals, @substrate-system/routes, Hono, Vite, Cloudflare Worker tooling (004-rewrite-nav-jsx)
- Filesystem static assets and generated build output (no new persistent storage) (004-rewrite-nav-jsx)
- TypeScript (ES2022, strict mode) + Preact, route-event, Hono, Vite build pipeline (006-migrate-htm-rendering)

- TypeScript (ESM), Node.js runtime, Vite 7.x toolchain + Vite, Hono, Preact, `@cloudflare/vite-plugin`, `@hono/vite-dev-server` (001-fix-npm-start)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (ESM), Node.js runtime, Vite 7.x toolchain: Follow standard conventions

## Recent Changes
- 006-migrate-htm-rendering: Added TypeScript (ES2022, strict mode) + Preact, route-event, Hono, Vite build pipeline
- 006-migrate-htm-rendering: Added TypeScript (ES2022, strict mode) + Preact, route-event, Hono, Vite build pipeline
- 004-rewrite-nav-jsx: Added TypeScript (ESM), Node.js runtime + Preact, @preact/signals, @substrate-system/routes, Hono, Vite, Cloudflare Worker tooling


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
