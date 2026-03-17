# template-hono-spa Development Guidelines

## 1. Project Context

**Project Goal**: This is a template repo for web application that use Cloudflare
as the backend, and an SPA architecture for the frontend.

**Tech Stack**: `preact`, `htm` (template literals for the view),
`@preact/signals` for all client-side state, `Cloudflare` services including D1
database, Passkeys

## 2. Coding Standards

Write as little code as possible. Any time there is a free Cloudfalre service
that can accomplish something for use, use that.

Use `@preact/signals` for all client-side application state.

## 3. Workflow Commands

- **Install**: `npm install`
- **Test**: `npm test`

## 4. Constraints

* Do not add new dependencies without asking first.

---

## Project Structure

```text
src/
├── client
├── server
tests/
```

* `src/client` has frontend code
* `src/server` has the backend

## Commands

npm test && npm run lint

## Code Style

TypeScript (ESM): Follow standard conventions

## Recent Changes
- 048-confirm-revoke-device: Added TypeScript (ES2022), ESM + Preact + @preact/signals, htm/preact,
- 047-revoke-device-logout: Added TypeScript (ES2022) + ESM + Hono (server), Cloudflare Workers, `@simplewebauthn/server`
- 046-prevent-self-revoke: Added TypeScript (ES2022) + Hono (server), Preact + Signals (client)
