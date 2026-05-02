# Contract: Shell Response

The only externally-observable interface this feature changes is the
HTTP response on shell-serving routes. This document is the contract
that production behavior must satisfy and that tests assert against.

## Scope

A *shell route* is any request the existing
`shouldServeShell(pathname)` predicate
(`src/server/index.ts:558`) returns `true` for. As of today, that is any
GET request that is **not**:

- `/health`
- `/api` or anything under `/api/`
- `/@<vite-internal>` or `/__vite*` or `/node_modules/...`
- a path that "looks like an asset" (regex: `/\.[a-z0-9]+$/i`)

Routing logic is **out of scope** for this feature (assumption stated in
spec). This contract applies only to what the shell route returns.

## Successful response

**Request**

```http
GET /
Host: <any>
```

(or any deep client route such as `/profile`, `/login`, `/about`)

**Response**

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8

<contents of public/client/index.html, byte-identical, with hashed
asset URLs as inlined by Vite at build time>
```

**Required body properties**

- Starts with `<!DOCTYPE html>` (case-insensitive).
- Contains `<html lang="en">`.
- Contains `<title>Hono + Preact</title>` (until/unless the source
  `index.html` is edited).
- Contains `<div id="root"></div>`.
- Contains a `<script type="module">` whose `src` matches the
  hashed JS reference present in `public/client/index.html` for the
  current build.
- Contains a `<link rel="stylesheet">` (or equivalent) referencing the
  hashed CSS file from the same manifest entry.
- Does **not** contain anything assembled from string-array literals in
  `src/server/`. (Enforced statically via grep test.)

## Failure response

If the shell file cannot be loaded (binding missing, fetch non-200,
fetch throws), the server MUST respond with:

```http
HTTP/1.1 500 Internal Server Error
Content-Type: text/plain; charset=UTF-8

Startup prerequisite error: <cause>. Next step: <remediation>
```

**Required body properties**

- Starts with the literal `Startup prerequisite error:` prefix.
- Contains the literal `Next step:` separator.
- Names a remediation step (e.g.
  "Run `npm run build` and verify `public/client/index.html` is
  deployed.").

**Required side effects**

- A `console.warn` call writes the same string to the Worker logs.
- The process does **not** crash; subsequent requests still receive a
  response.

## Static invariants (CI-enforceable)

These are not response-level assertions; they're properties of the
server source that must hold to satisfy the spec's source-of-truth
requirement:

- `git grep -nE '<!DOCTYPE|<html|<head>|<body>' src/server/` returns
  zero matches in request-handling code paths.
- Editing `index.html` and rebuilding (`npm run build`) changes the
  served response without any matching change to files under
  `src/server/`.

## Out of scope

- Caching headers (`Cache-Control`, `ETag`) — the upstream `ASSETS`
  binding's defaults are inherited unchanged.
- Compression — handled by the Workers runtime.
- The HTML content itself (titles, meta tags) — owned by the source
  `index.html` file, not by this contract.
