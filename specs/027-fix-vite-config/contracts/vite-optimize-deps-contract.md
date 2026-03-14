# Contract: Vite Dependency Optimization Warning Removal

## Purpose

Define the observable behavior required after fixing the dependency-optimization deprecation warning reported during `npm start`.

## Contract Rules

1. The repository must allow `npm start` to complete local dev-server startup without the reported warning about deprecated dependency-optimization configuration.
2. The local startup entry point must remain `npm start`; contributors must not need a replacement command.
3. The application must remain reachable at the expected local development address after startup.
4. The configuration must use a supported dependency-optimization path if such configuration is required for the repository or its plugins.
5. The fix must not introduce new manual local-setup workarounds for routine development.
6. The compatibility-sensitive configuration surface must remain localized and understandable enough for future maintenance.
7. Any temporary compatibility shim for plugin-provided config must stay localized to [/Users/nick/code/template-hono-spa/vite.config.js](/Users/nick/code/template-hono-spa/vite.config.js) and rewrite deprecated optimize-deps settings before Vite resolves them.

## Covered Surfaces

- Repository configuration in [/Users/nick/code/template-hono-spa/vite.config.js](/Users/nick/code/template-hono-spa/vite.config.js)
- Startup command definition in [/Users/nick/code/template-hono-spa/package.json](/Users/nick/code/template-hono-spa/package.json)
- Regression coverage in [/Users/nick/code/template-hono-spa/test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and [/Users/nick/code/template-hono-spa/test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts)

## Verification

- Automated validation should confirm lint and tests remain green after the configuration change.
- Runtime validation should confirm `npm start` no longer emits the reported warning and still serves the application locally.
- Review should confirm the maintained configuration no longer depends on the deprecated optimization path.
- Unit validation should confirm the worker environment resolves dependency-optimization settings through `rolldownOptions` rather than plugin-provided deprecated config.
