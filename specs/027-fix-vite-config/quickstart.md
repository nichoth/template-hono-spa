# Quickstart: Vite Dependency Optimization Warning Fix

## Goal

Verify that the repository no longer emits the dependency-optimization deprecation warning during `npm start` and that local development behavior remains intact.

## Steps

1. From [/Users/nick/code/template-hono-spa/package.json](/Users/nick/code/template-hono-spa/package.json), confirm `npm start` remains the standard local startup command.
2. Start the repository with `npm start`.
3. Observe startup output and confirm it does not include the warning about `optimizeDeps.esbuildOptions` being deprecated in favor of `optimizeDeps.rolldownOptions`.
4. Confirm the dev server reports a usable local address and serves the application successfully. If the preferred port is already occupied, Vite may choose the next available local port automatically.
5. Open the home route and at least one secondary route to confirm route and asset delivery still work after the warning fix.
6. Run `npm run lint`.
7. Run `HOME=/tmp npm test`.
8. Optionally resolve the Vite config in a Node shell and confirm the worker environment carries the compatibility values under `optimizeDeps.rolldownOptions`.

## Expected Results

- Startup completes without the reported dependency-optimization deprecation warning.
- Contributors still use the same local startup command as before.
- The application remains reachable locally after startup.
- Lint and test workflows still pass.
