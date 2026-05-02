## Implementation Plan: Serve index.html as a Static File

**Branch**: `052-serve-index-html` | **Date**: 2026-05-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/052-serve-index-html/spec.md`

## Summary

The server currently constructs the SPA shell HTML at request time by joining
an array of string literals in `shellPage()` (`src/server/index.ts:614-628`).
That violates the requirement that `index.html` be the single source of truth
for the shell. Instead, the server will fetch the built `index.html` directly
from the Cloudflare Workers `ASSETS` binding (which Vite has already produced
with hashed asset references at build time) and return its body with an HTML
content type. In local dev, the same code path delegates to Vite via the
`ASSETS` binding so the developer's edits to the project's `index.html` show
up live without any HTML construction in server code. When the shell file
cannot be fetched, the existing `formatStartupFailure` 500 response and log
warning behavior is preserved.

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022, ESM)
**Primary Dependencies**: Hono `^4.12.8`, `@cloudflare/vite-plugin`,
Cloudflare Workers runtime, Vite `^7.3.1`
**Storage**: N/A for this feature. Static asset content reached through the
Cloudflare Workers `ASSETS` (Fetcher) binding configured in `wrangler.jsonc`
(`assets.directory: ./public/`).
**Testing**: `vitest` with `@cloudflare/vitest-pool-workers` (unit + workers
integration tests) — see `test/unit.spec.ts`, `test/integration.spec.ts`.
**Target Platform**: Cloudflare Workers (production) + Vite dev server
(`localhost:8888`) for local development.
**Project Type**: Web application (Hono server + Preact SPA in one repo).
**Performance Goals**: No new perf budget. Shell response is one extra
sub-request to the local `ASSETS` Fetcher; cache the response body in worker
isolate memory so subsequent requests don't re-fetch.
**Constraints**: Worker entry runs first (`run_worker_first: true`), so the
catch-all in `src/server/index.ts:463-475` is what serves the shell. Must not
break `/api/*`, `/health`, or asset routes. Must not regress dev workflow.
**Scale/Scope**: One Worker route handler, one server source file changed,
optional removal of `src/server/startup-assets.ts` and its tests once the
manifest-driven asset resolution becomes dead code.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository's `.specify/memory/constitution.md` is the unfilled template
(all `[PLACEHOLDER]` content). There are no ratified principles to gate
against. Project guidance comes from `AGENTS.md` / `CLAUDE.md`:

- "Write as little code as possible." → This change removes inline HTML
  string construction and (likely) the `startup-assets.ts` manifest reader,
  reducing surface area. PASS.
- "If a free Cloudflare service can accomplish something, use it." → Uses
  the existing `ASSETS` Fetcher binding rather than introducing a build-time
  HTML import or a custom asset reader. PASS.
- "Do not add new dependencies without asking first." → No new deps
  required. PASS.
- "TypeScript style: no spaces between colon and type annotation." → All
  new code in `src/server/index.ts` follows the existing style. PASS.

No violations. No entries in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/052-serve-index-html/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── shell-response.md   # HTTP contract for shell route responses
├── spec.md
└── tasks.md             # Phase 2 output (created later by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── client/                  # Preact SPA — unchanged by this feature
└── server/
    ├── index.ts             # CHANGED: shellPage() reads index.html via
    │                        # ASSETS binding instead of joining strings
    ├── startup-assets.ts    # CANDIDATE FOR REMOVAL: manifest-driven asset
    │                        # resolution becomes dead code once the built
    │                        # index.html is served as-is
    ├── startup-errors.ts    # UNCHANGED: formatStartupFailure() reused for
    │                        # the shell-fetch failure response
    └── …                    # other handlers (auth/, basic-auth, etc.)

test/
├── unit.spec.ts             # CHANGED: existing "App shell routes" assertions
│                            # already check the response body for <html>,
│                            # title, root mount; add shell-fetch failure
│                            # path; remove startup-assets tests if file is
│                            # deleted
├── integration.spec.ts      # CHANGED MINIMALLY: extend "App shell" test
│                            # to assert the served body equals the bundled
│                            # public/client/index.html (modulo hashed paths)
└── …

index.html                   # SOURCE OF TRUTH (already exists at repo root) —
                             # consumed by Vite as the build entry; the built
                             # variant lands at public/client/index.html with
                             # hashed asset URLs inlined.
```

**Structure Decision**: This is the existing Hono + Preact SPA layout (option
2 from the template, adapted: `src/server/` + `src/client/` in a single repo,
with tests in `test/`). The feature touches only `src/server/index.ts` (and
removes `src/server/startup-assets.ts` if its only caller goes away).

## Phase 0 — Research (output: research.md)

Open questions to resolve:

1. **How does a Cloudflare Worker fetch the built `index.html` at request
   time?** — Verify that `c.env.ASSETS.fetch('http://assets/index.html')`
   returns the bundled shell from `public/client/index.html` (the wrangler
   `assets.directory` is `./public/` but the built shell lives under
   `public/client/` because the Cloudflare Vite plugin nests the client
   output). Confirm the exact URL path the binding expects.
2. **Does the built `index.html` already inline hashed asset URLs?** —
   `public/client/index.html` shows
   `src="/assets/index-CkIVRfAT.js"` and
   `href="/assets/index-D0Dknbiw.css"`, so yes. Once we serve the file
   verbatim, we can drop the manifest-reading code.
3. **What happens in `vite dev`?** — In dev, the Cloudflare Vite plugin
   exposes the dev server's middlewares through the `ASSETS` binding; a
   request for `/index.html` (or `/`) is served by Vite with its dev-time
   transforms (raw `src/client/index.ts`, raw `src/style.css`). Need to
   confirm whether the catch-all even runs in dev (since Vite normally
   handles `/`) — and if it does, fetching `/index.html` via the binding
   should still work.
4. **What's the right Content-Type?** — The bundled file is HTML; Hono's
   `c.html()` already sets `text/html; charset=UTF-8`. Reuse it.
5. **Failure modes for the shell fetch** — Binding missing (`c.env.ASSETS`
   undefined), fetch resolves with non-2xx, fetch throws. Each must produce
   the same `formatStartupFailure` 500 + log warning that the existing code
   produces today.
6. **Should the shell body be cached in the worker isolate?** — Yes, mirror
   the existing `cachedAssets` pattern (`let cachedShell:string|null = null`)
   so each isolate fetches the bundled HTML at most once. Invalidating on
   deploy is automatic because new isolates spin up.
7. **Tests to update** — `test/unit.spec.ts` "App shell routes" already
   asserts `<html lang="en">`, "Hono + Preact", and `<div id="root">`,
   which all match `index.html`. The startup-assets tests
   (`test/unit.spec.ts:758-816`) become irrelevant if the file is removed
   and should be deleted alongside it.

The research agent will produce `research.md` answering each question with a
**Decision / Rationale / Alternatives considered** block.

## Phase 1 — Design & Contracts

### `data-model.md`

This feature has no domain entities (no DB changes, no new state). The data
model captures the two static artifacts and how they relate:

- **Source shell** (`index.html` at repo root) — hand-authored. Asset
  references use dev paths (`src/style.css`, `src/client/index.ts`).
- **Built shell** (`public/client/index.html`) — produced by Vite during
  `npm run build`. Asset references are content-hashed
  (`/assets/index-<hash>.{js,css}`). This is the artifact the server returns
  in production.

The data-model file documents the lifecycle: edit source → `vite build` →
built shell + hashed assets → served by Worker via `ASSETS` binding.

### `contracts/shell-response.md`

The only externally observable contract that changes: the HTTP response on
shell routes. Documented as:

- **Request**: `GET /` or any non-API, non-asset, non-`/health` path.
- **Response (success)**: `200 OK`, `Content-Type: text/html; charset=UTF-8`,
  body byte-identical to `public/client/index.html`.
- **Response (failure to load shell)**: `500 Internal Server Error`,
  `Content-Type: text/plain`, body matching the existing
  `formatStartupFailure` template (`Startup prerequisite error: <cause>.
  Next step: <remediation>`). A warning is logged via `console.warn`.

### `quickstart.md`

Verification recipe for a developer or reviewer:

1. `npm install`
2. `npm run build` — produces `public/client/index.html` with hashed assets.
3. `npm test` — unit + workers integration tests pass.
4. `npx wrangler dev` — visit `http://localhost:9999/` and confirm the
   served HTML matches `public/client/index.html`.
5. `npm start` — visit `http://localhost:8888/` and confirm the served HTML
   reflects edits to the project's `index.html` without any matching server
   change.
6. `grep -nE "<!DOCTYPE|<html|<head>|<body>" src/server/` — must return zero
   matches in request-handling code.

### Agent context update

Run `.specify/scripts/bash/update-agent-context.sh claude` at the end of
Phase 1 to refresh `CLAUDE.md` / `AGENTS.md` with any new tech facts (none
new for this feature; the script's job is to keep the "Recent Changes" log
in sync).

### Post-design Constitution re-check

Re-verifying the AGENTS.md gates after the design is fleshed out:

- "Write as little code as possible." — Net change is *less* code: the
  `shellPage()` body shrinks from a 14-line HTML literal to a single fetch
  call, and `startup-assets.ts` (~120 LOC) becomes a candidate for deletion
  along with its tests. PASS.
- "If a free Cloudflare service can accomplish something, use it." — The
  `ASSETS` Fetcher binding (already configured) does exactly the job. PASS.
- No new dependencies. PASS.
- TypeScript style preserved (no-space colon annotations, ternary layout
  per `CLAUDE.md`). PASS.

No violations. Complexity Tracking remains empty.

## Phase 2 — Task planning (deferred)

`/speckit.plan` stops at the end of Phase 1. The follow-up `/speckit.tasks`
command will turn this plan into an ordered task list driven by the
acceptance scenarios in `spec.md` (US1 → US2 → edge cases) and the
contracts in `contracts/shell-response.md`.

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| —         | —          | —                                    |
