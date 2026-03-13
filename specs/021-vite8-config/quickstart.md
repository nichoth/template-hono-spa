# Quickstart: Vite 8 Config Compatibility

## Prerequisites

- Install dependencies in the repository root
- Work from branch `021-vite8-config`

## Automated Validation

1. Run lint:

```sh
cd /Users/nick/code/template-hono-spa && npm run lint
```

2. Run the full test suite:

```sh
cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test
```

3. Run the production build:

```sh
cd /Users/nick/code/template-hono-spa && npm run build
```

## Manual Validation

1. Start local development:

```sh
cd /Users/nick/code/template-hono-spa && npm start
```

2. Open `http://127.0.0.1:8888/`.
   - Expect the application shell to load without configuration or startup errors
   - Expect local startup not to depend on a separate inspector-port bind succeeding

3. Open `http://127.0.0.1:8888/about` and `http://127.0.0.1:8888/login`.
   - Expect existing routes to render normally
   - Expect no missing-asset or manifest-related failures in the app shell

4. Stop the dev server and run `npm run build`.
   - Expect the build to complete without configuration rejection
   - Expect the generated public output and manifest flow to remain present for runtime asset resolution

## Validation Log

- 2026-03-13: Planning artifacts prepared for Vite 8 configuration compatibility.
- 2026-03-13: Root-cause investigation identified the local startup blocker as the Cloudflare inspector port bind path.
- 2026-03-13: Updated `vite.config.js` to disable the Cloudflare inspector port during local startup.
- 2026-03-13: `npm run build` completed successfully. Wrangler log-file writes still report `EPERM` in this sandbox, but the build exits successfully and outputs the expected assets.
- 2026-03-13: Local `npm start` progressed past the previous inspector-port bind failure and now stops on the terminal’s Node 16 runtime, which is below Vite 8’s required Node version.
- 2026-03-13: `HOME=/tmp npm test` confirms the new Vite config assertions pass, but the full suite still contains pre-existing login-route failures unrelated to this config change.
