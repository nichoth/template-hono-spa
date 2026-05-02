# Quickstart — Serve index.html as a Static File

How a developer or reviewer verifies this feature end-to-end.

## Prerequisites

- Node + npm installed; repo cloned.
- `npm install` has been run.

## 1. Build and inspect the bundled shell

```bash
npm run build
cat public/client/index.html
```

The file MUST contain content-hashed asset URLs that Vite emitted, e.g.

```html
<script type="module" crossorigin src="/assets/index-<hash>.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-<hash>.css">
```

Note the exact hash; you'll grep for it in step 3.

## 2. Run tests

```bash
npm test
```

Expected: all suites pass. The "App shell routes" describe block in
`test/unit.spec.ts` and the "App shell" describe block in
`test/integration.spec.ts` both exercise the new code path.

## 3. Run the Worker locally and confirm the served body

```bash
npx wrangler dev
# in another terminal:
curl -s http://localhost:9999/ | head -20
curl -s http://localhost:9999/profile | head -20
```

For both requests the response body MUST contain the hashed asset URL
you noted in step 1, proving the response is the bundled file
(not a hand-written template). The body is also identical between `/`
and `/profile` — that's the SPA shell behavior the spec guarantees.

```bash
diff <(curl -s http://localhost:9999/) public/client/index.html
```

Diff MUST be empty.

## 4. Run the Vite dev server and confirm dev parity

```bash
npm start
# browser opens at http://localhost:8888/
```

Edit the project root `index.html` (e.g. change `<title>Hono + Preact</title>`
to `<title>Hono + Preact (dev)</title>`), save, and reload. The page title
updates without restarting the dev server and without touching any file
under `src/server/`.

## 5. Confirm no inline HTML in server source

```bash
grep -nE '<!DOCTYPE|<html|<head>|<body>' src/server/
```

Expected: no matches.

## 6. Confirm graceful failure

Force the shell fetch to fail and confirm the 500 response is shaped
right. With the test suite this is exercised in
`test/unit.spec.ts` (new test added under "App shell routes"); manual
reproduction option:

```bash
mv public/client/index.html public/client/index.html.bak
npx wrangler dev
curl -i http://localhost:9999/
# Expect: HTTP/1.1 500
# Body: Startup prerequisite error: ... Next step: ...
mv public/client/index.html.bak public/client/index.html
```

The Worker logs MUST contain a `console.warn` line that matches the
response body.

## 7. Verify acceptance scenarios from the spec

Map quickstart steps back to spec acceptance scenarios:

| Spec scenario                                              | Verified by step |
|------------------------------------------------------------|------------------|
| US1.1 — `/` returns built shell with hashed assets         | 3                |
| US1.2 — deep route (`/profile`) returns same shell         | 3                |
| US1.3 — no inline HTML literals in server source           | 5                |
| US1.4 — editing `index.html` changes served response       | 4                |
| US2.1 — 5xx with cause + remediation when shell missing    | 6                |
| US2.2 — warning logged when shell missing                  | 6                |
