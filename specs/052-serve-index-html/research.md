# Phase 0 Research — Serve index.html as a Static File

All research questions surfaced in `plan.md` are resolved below in
**Decision / Rationale / Alternatives considered** form.

---

## R1. How does the Worker fetch the built `index.html` at request time?

**Decision**: Call `c.env.ASSETS.fetch(new Request('http://assets/index.html'))`
inside the shell handler.

**Rationale**: The `ASSETS` binding in `wrangler.jsonc` points at
`./public/`. When the Cloudflare Vite plugin builds the SPA, the entry
HTML is emitted under `public/client/` (verified on disk:
`public/client/index.html`, `public/client/vite-manifest.json`,
`public/client/assets/`). The asset Fetcher resolves request paths against
its configured directory. The existing
`resolveStartupAssets` already uses the same pattern
(`fetcher.fetch('http://assets/vite-manifest.json')`,
`src/server/startup-assets.ts:59`) and works in production, so requesting
`http://assets/index.html` via the same binding returns the bundled shell.
The hostname (`assets`) is irrelevant — only the pathname is matched.

**Alternatives considered**:

- *Embedding `index.html` as a build-time TypeScript import* (e.g.
  `import shellHtml from '../../public/client/index.html?raw'`). Rejected:
  it pins the file location, requires re-bundling when the shell changes,
  and Cloudflare Workers Vite builds do not currently treat `?raw` HTML
  imports from outside `src/` as first-class. The ASSETS binding is the
  Cloudflare-blessed path.
- *Reading `index.html` from a KV namespace*. Rejected: extra moving part
  for zero benefit; the Worker already has the assets binding.

---

## R2. Does the built `index.html` already inline hashed asset URLs?

**Decision**: Yes. Serve the file verbatim and drop the manifest-reading
code path.

**Rationale**: Inspection of `public/client/index.html` after `npm run
build` shows Vite has rewritten asset references to:

```html
<script type="module" crossorigin src="/assets/index-CkIVRfAT.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-D0Dknbiw.css">
```

This means `resolveStartupAssets` and the `vite-manifest.json` lookup
exist solely to splice these paths back into a hand-written HTML
template. Once the template *is* the file Vite produced, the manifest
code becomes dead.

**Alternatives considered**:

- *Keep the manifest reader and use it to template a separate `.html`
  file*. Rejected: still constructs HTML at request time and leaves a
  redundant moving part. Spec FR-002 forbids it.

---

## R3. What happens during `vite dev` (`npm start`)?

**Decision**: In dev mode the same handler runs, but the request never
reaches the shell branch in the typical loop. When it does, the
`ASSETS.fetch('http://assets/index.html')` call is proxied by the
Cloudflare Vite plugin to Vite's middleware, which serves the project
root `index.html` with its dev-time transforms (un-hashed source paths,
HMR client injected). No special-casing needed in our code.

**Rationale**: `@cloudflare/vite-plugin` registers the dev server as the
backing fetcher for the `ASSETS` binding when running under `vite`. The
project already relies on this for static asset requests during dev.
Verified by the existing `resolveStartupAssets` flow which fetches the
manifest in dev too without crashing.

**Alternatives considered**:

- *Branch on `import.meta.env.DEV` and short-circuit to a hard-coded
  string*. Rejected: that is exactly what the spec forbids (FR-002, FR-008
  — single source of truth, no inline strings).
- *In dev, redirect `/` to Vite's middleware explicitly*. Rejected: the
  Cloudflare Vite plugin already does this transparently.

---

## R4. What `Content-Type` should the response carry?

**Decision**: `text/html; charset=UTF-8`. Use Hono's `c.html(body)` helper
or copy the upstream `Content-Type` header from the ASSETS response.

**Rationale**: The bundled file is HTML; the spec (FR-007, edge-case
bullet) requires an HTML content type so browsers render it correctly.
`c.html()` matches the existing convention in the repo
(`src/server/index.ts:630`).

**Alternatives considered**:

- *Pipe the upstream `Response` body through directly*. Acceptable but
  more code; the body is small and `c.html()` is idiomatic.

---

## R5. Failure modes for the shell fetch

**Decision**: Three failure modes mapped to one shared 500 response and
one log warning, mirroring today's behavior:

| Failure                                | Cause string                                | Remediation string                                                |
|----------------------------------------|---------------------------------------------|-------------------------------------------------------------------|
| `c.env.ASSETS` is undefined            | "Static asset binding is unavailable."      | "Run `npm start` for local dev or `npm run build`, then redeploy." |
| `ASSETS.fetch` resolves with non-200   | "Bundled `index.html` not found in assets." | "Run `npm run build` and verify `public/client/index.html` is deployed." |
| `ASSETS.fetch` throws                  | The thrown `Error.message`                  | Same as above.                                                    |

Each failure path:

1. Calls `console.warn(formatStartupFailure({ cause, remediation }))`.
2. Returns `c.text(formatStartupFailure({ cause, remediation }), 500)`.

**Rationale**: Preserves the operational quality of the current handler
(spec US2, FR-006, SC-005) and reuses `formatStartupFailure` so the
existing test (`test/unit.spec.ts:819-832`) keeps passing.

**Alternatives considered**:

- *Different status codes per failure*. Rejected: the spec asks for a
  single 5xx response with a clear cause; the cause string differentiates.
- *Crash-loud (`throw`)*. Rejected: spec FR-006 / SC-005 require the
  process to keep running.

---

## R6. Should the shell body be cached per worker isolate?

**Decision**: Yes. Add `let cachedShellHtml:string|null = null` at module
scope (next to the existing `cachedAssets`) and populate it on first
successful fetch.

**Rationale**: Cloudflare Workers spin up fresh isolates on deploy, so a
module-scope cache is automatically invalidated when a new build is
deployed. Mirrors the existing `cachedAssets` pattern in the same file
(`src/server/index.ts:34`). Avoids one extra ASSETS sub-request per page
load. Cheap.

**Alternatives considered**:

- *No cache*. Acceptable but wasteful; the file does not change within an
  isolate's lifetime.
- *`caches.default` Cache API*. Overkill for a single static file.

---

## R7. Which existing tests are affected?

**Decision**: Update assertions in two places, delete one block.

- `test/unit.spec.ts` "App shell routes" describe block
  (lines 183-250): assertions already check the response body for
  `<html lang="en">`, "Hono + Preact", and `<div id="root">`. Those all
  appear in the project's `index.html` and continue to pass. Add a new
  test for the shell-fetch failure path that asserts the response status
  is 500 and the body matches the `formatStartupFailure` shape.
- `test/unit.spec.ts` "Vite manifest" / `resolveStartupAssets` block
  (lines ~720-816): delete if `src/server/startup-assets.ts` is deleted.
- `test/unit.spec.ts` "Migration constraints" block
  (lines 834-846): keep — it asserts the server entry has no JSX and no
  remaining `.tsx` files. Optionally add a new constraint:
  "no `<!DOCTYPE` / `<html` / `<head>` / `<body>` substring in
  `src/server/**/*.ts`" to enforce SC-001 going forward.
- `test/integration.spec.ts` "App shell" describe block
  (lines 112-140): existing assertions still pass; add one more asserting
  the served body contains the same hashed asset reference visible in
  `public/client/index.html` (proves end-to-end that the served file is
  the bundled file, not a hand-written template).

**Rationale**: Maintains coverage of the contract changes and enforces
the no-inline-HTML invariant in CI.

**Alternatives considered**:

- *Snapshot the entire response body against `public/client/index.html`*.
  Rejected: hashed asset filenames change every build, so the snapshot
  would constantly drift. A targeted contains-check is more robust.
