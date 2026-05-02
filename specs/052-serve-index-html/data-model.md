# Phase 1 Data Model — Serve index.html as a Static File

This feature has no domain entities and no database changes. The relevant
"data" is the static HTML shell artifact and how it flows from source to
the served response. Documented here so reviewers can reason about the
single source of truth requirement (FR-008, SC-002, SC-003).

## Artifacts

### Source shell

- **Identity**: `index.html` at the repository root.
- **Authored by**: humans (designers, developers).
- **Tooling**: edited as plain HTML; lints/diffs as HTML.
- **Asset references**: dev-time paths
  (`src/style.css`, `src/client/index.ts`).
- **Consumers**:
  - Vite dev server (`npm start`) serves it directly with HMR transforms.
  - Vite build (`npm run build`) consumes it as the entry HTML.

### Built shell

- **Identity**: `public/client/index.html`.
- **Produced by**: `vite build` (script: `npm run build`).
- **Asset references**: production-hashed paths
  (`/assets/index-<hash>.js`, `/assets/index-<hash>.css`) inlined by Vite
  at build time.
- **Consumers**:
  - The Cloudflare Workers `ASSETS` Fetcher binding
    (`wrangler.jsonc → assets.directory: ./public/`) — exposes it at the
    request path `/index.html` (and as the SPA fallback for client
    routes when `not_found_handling: single-page-application`).
  - The server's shell handler (this feature) — fetches it via the
    binding and returns its body as the HTTP response.

### In-isolate cache

- **Identity**: a module-scope `string | null` in `src/server/index.ts`
  next to the existing `cachedAssets`.
- **Lifetime**: one Worker isolate. Reset implicitly on each new deploy
  (new isolates), so editing-and-rebuilding the source shell propagates
  automatically.
- **Population**: first successful `ASSETS.fetch('http://assets/index.html')`
  call.

## Lifecycle

```text
       edit                        vite build                        deploy
  index.html  ────────────►  public/client/index.html  ────────►  ASSETS binding
  (repo root,                  (hashed asset URLs                  (Cloudflare
   single source                 inlined by Vite)                   Workers)
   of truth)
                                                                       │
                                                                       ▼
                                                              c.env.ASSETS.fetch
                                                              ('http://assets/
                                                               index.html')
                                                                       │
                                                                       ▼
                                                            cachedShellHtml ──► c.html(...)
```

## Validation rules

These are the invariants this feature must preserve. They are stated
prose-only because they have no schema:

1. The `index.html` file at the repo root MUST be the only hand-authored
   shell. Server source code MUST NOT contain `<!DOCTYPE`, `<html`,
   `<head>`, or `<body>` substrings inside request-handling code
   (SC-001). A unit test enforces this.
2. After `vite build`, `public/client/index.html` MUST exist and MUST
   contain hashed asset references. (Implicit Vite contract; verified
   manually in quickstart and indirectly by the integration test.)
3. The byte-content of the served response on `/`, after asset-path
   substitution by Vite, MUST equal the byte-content of
   `public/client/index.html` (SC-002). The integration test asserts a
   structural subset (presence of the same hashed JS reference).

## State transitions

None. The shell is an immutable artifact within a deploy. The only
"transition" is the cache populate-on-first-read step in R6 of
`research.md`.
