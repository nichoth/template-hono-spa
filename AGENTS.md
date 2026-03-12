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
- TypeScript (ES2022, strict mode), CSS + Preact, route-event, Hono, Vite (007-fix-grid-columns)
- TypeScript (ES2022, strict mode) + Hono, Cloudflare Workers runtime bindings, Vite build/runtime tooling (009-staging-basic-auth)
- TypeScript (ES2022, strict mode) + Hono, Cloudflare Workers runtime bindings, Vite tooling (010-add-foobar-endpoint)
- TypeScript (ES2022, strict mode), CSS + Preact, route-event, Hono, Vite, `@substrate-system/*` style packages (011-remove-media-queries)
- TypeScript ES2022 in strict mode + Vitest 3.2, `@cloudflare/vitest-pool-workers`, `@cloudflare/workers-types`, Vite 7, Hono, Preac (012-fix-test-types)
- TypeScript (ES2022, strict mode) + Hono, Cloudflare Workers runtime bindings, Vite 7, Vitest 3 (013-staging-basic-auth)
- TypeScript (ES2022, strict mode) and CSS + Preact, `htm/preact`, `@preact/signals`, `route-event`, Hono, `@substrate-system/routes`, `@substrate-system/button`, `@substrate-system/input`, `@substrate-system/password-input` (015-login-route)
- TypeScript (ES2022, strict mode) and CSS + Preact, `htm/preact`, `@preact/signals`, Hono, Vite, `@substrate-system/routes`, `@substrate-system/hamburger-two` (001-mobile-nav)
- Markdown documentation in a TypeScript/Node.js repository + README.md, existing Wrangler staging environment configuration, existing staging auth secret naming (002-staging-password-docs)
- TypeScript (ES2022, strict mode) and CSS + Preact, Hono, Vite 7, `route-event`, `@substrate-system/*` UI packages, Lightning CSS custom-media suppor (016-css-color-vars)

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
- 016-css-color-vars: Added TypeScript (ES2022, strict mode) and CSS + Preact, Hono, Vite 7, `route-event`, `@substrate-system/*` UI packages, Lightning CSS custom-media suppor
- 002-staging-password-docs: Added Markdown documentation in a TypeScript/Node.js repository + README.md, existing Wrangler staging environment configuration, existing staging auth secret naming
- 001-mobile-nav: Added TypeScript (ES2022, strict mode) and CSS + Preact, `htm/preact`, `@preact/signals`, Hono, Vite, `@substrate-system/routes`, `@substrate-system/hamburger-two`


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
