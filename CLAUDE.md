# template-hono-spa Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-16

## Active Technologies
- TypeScript (ES2022 target) + Hono (server), Preact + Signals (041-device-invite-link)
- Cloudflare D1 (SQLite) (041-device-invite-link)
- TypeScript (ES2022 target) + Preact + Signals (frontend), Hono (server) (042-fix-device-name)
- Cloudflare D1 (SQLite) — no schema changes needed (042-fix-device-name)
- TypeScript (ES2022) + Preact + @preact/signals, htm/preac (043-require-device-name)
- N/A — no storage changes (043-require-device-name)
- TypeScript (ES2022) + ESM + Hono (server framework), Web Crypto API (`crypto.subtle`) (044-timing-safe-basic-auth)
- TypeScript (ES2022) + Hono (server), Preact + Signals (frontend), (045-indicate-current-device)
- Cloudflare D1; one new nullable column `device_id TEXT` on (045-indicate-current-device)
- Cloudflare D1 — one new nullable column `device_id TEXT` on (045-indicate-current-device)
- TypeScript (ES2022) + Hono (server), Preact + Signals (client) (046-prevent-self-revoke)
- Cloudflare D1 (SQLite) — no schema changes required (046-prevent-self-revoke)
- TypeScript (ES2022) + ESM + Hono (server), Cloudflare Workers, `@simplewebauthn/server` (047-revoke-device-logout)
- TypeScript (ES2022), ESM + Preact + @preact/signals, htm/preact, (048-confirm-revoke-device)
- Cloudflare D1 — no schema changes (048-confirm-revoke-device)

- TypeScript (ESM) + Hono (server), Preact + Signals (040-add-passkey-device)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (ESM): Follow standard conventions

## Recent Changes
- 048-confirm-revoke-device: Added TypeScript (ES2022), ESM + Preact + @preact/signals, htm/preact,
- 047-revoke-device-logout: Added TypeScript (ES2022) + ESM + Hono (server), Cloudflare Workers, `@simplewebauthn/server`
- 046-prevent-self-revoke: Added TypeScript (ES2022) + Hono (server), Preact + Signals (client)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
