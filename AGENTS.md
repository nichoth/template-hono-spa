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
- TypeScript (ES2022, strict mode) and CSS + Preact, `htm/preact`, `@preact/signals`, Hono, Vite 7, `@substrate-system/button`, `@substrate-system/input`, `@substrate-system/password-input`, existing route-management utilities (017-passkey-login-ux)
- TypeScript (ES2022, strict mode) and CSS + Preact, `htm/preact`, `@preact/signals`, Hono, Vite 7, `@substrate-system/button`, `@substrate-system/input`, `@substrate-system/password-input`, `@substrate-system/radio-input`, existing route-management utilities (018-radio-passkey-control)
- TypeScript (ESM, ES2022 strict mode), JavaScript config files, CSS + Vite 8, Vitest 3, Hono, Preact, `@cloudflare/vite-plugin`, `@hono/vite-dev-server`, Lightning CSS, Browserslis (021-vite8-config)
- Filesystem build output only (`public/`, generated manifest) (021-vite8-config)
- TypeScript (ES2022 strict mode), browser WebAuthn/browser credential objects, JSON request/response payloads + Preact signals app state, `ky` for HTTP requests, current login route UI, Hono-backed API routes, existing request-state helpers (022-passkey-login-payload)
- N/A on the client; request/response contract only (022-passkey-login-payload)
- TypeScript (ES2022, strict mode) + Hono, Preact, `@preact/signals`, `ky`, Wrangler, Cloudflare Workers runtime, Web Crypto APIs, browser WebAuthn APIs (023-passkey-auth-backend)
- Cloudflare D1 for users, passkey credentials, auth challenges, sessions, and auth events (023-passkey-auth-backend)
- TypeScript (ESM, ES2022 strict mode) + Preact, Hono, Vite 8, `route-event`, `ky`, `@substrate-system/radio-input`, `@substrate-system/input`, `@substrate-system/password-input`, `@simplewebauthn/browser`, `@simplewebauthn/server` (024-signup-route)
- Cloudflare D1 auth persistence already used by the existing auth backend (024-signup-route)
- TypeScript (ES2022, strict mode) and CSS via Vite 8 + Preact, `htm/preact`, `@preact/signals`, Hono shell app, Lightning CSS pipeline (025-square-cards)
- TypeScript (ES2022, strict mode) and CSS via Vite 8 + Preact, `htm/preact`, `@preact/signals`, `@substrate-system/routes`, `@substrate-system/radio-input`, Hono, `ky`, `@simplewebauthn/browser`, `@simplewebauthn/server` (026-signup-route)
- Cloudflare D1 auth tables already used for users, challenges, credentials, sessions, and auth events (026-signup-route)
- N/A for runtime data; filesystem build output under `public/` (027-fix-vite-config)
- TypeScript (ES2022) + Hono, route-event routing utilities, `@cloudflare/workers-types`, `@cloudflare/d1`, and Preact client hooks where needed (028-passkey-devices)
- Cloudflare D1 relational database for `users` and `devices` tables (028-passkey-devices)
- TypeScript 5.9 targeting ES2022 modules running in Vite 8-built client and Cloudflare Workers shell. + Preact 10, `@preact/signals`, `htm`, `State` helpers from `@substrate-system/state`, Hono-powered server routes, `ky` for HTTP requests. (030-show-login-state)
- No new storage; header reads transient `Session` data returned from `/api/session`. (030-show-login-state)
- TypeScript 5.9 targeting ES2022 modules in a Vite 8-built client running on Cloudflare Workers. + Preact 10, `@preact/signals`, `route-event` routing helpers, `@substrate-system` state utilities, Hono for API routing, `ky` for HTTP calls. (031-hide-auth-links)
- No persistent storage changes; the header watches the same session signal populated by `/api/session`. (031-hide-auth-links)
- TypeScript 5.9 targeting ES2022 modules with Vite 8 and Cloudflare Workers. + Preact, `@preact/signals`, LightningCSS-managed CSS with custom media queries, Hono, `ky`. (032-custom-media-breakpoints)
- Not applicable—CSS-only change. (032-custom-media-breakpoints)
- TypeScript (ES2022) with CSS modules compiled by LightningCSS + Vite 8 build system, Preact + `htm/preact`, `@substrate-system` UI primitives, `route-event`, Hono for Cloudflare Workers routing, and shared LightningCSS config (034-profile-logout-button)
- N/A (UI-only adjustment; session state is client-derived and cleared via existing auth service) (034-profile-logout-button)

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
- 034-profile-logout-button: Added TypeScript (ES2022) with CSS modules compiled by LightningCSS + Vite 8 build system, Preact + `htm/preact`, `@substrate-system` UI primitives, `route-event`, Hono for Cloudflare Workers routing, and shared LightningCSS config
- 032-custom-media-breakpoints: Added TypeScript 5.9 targeting ES2022 modules with Vite 8 and Cloudflare Workers. + Preact, `@preact/signals`, LightningCSS-managed CSS with custom media queries, Hono, `ky`.
- 031-hide-auth-links: Added TypeScript 5.9 targeting ES2022 modules in a Vite 8-built client running on Cloudflare Workers. + Preact 10, `@preact/signals`, `route-event` routing helpers, `@substrate-system` state utilities, Hono for API routing, `ky` for HTTP calls.


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
