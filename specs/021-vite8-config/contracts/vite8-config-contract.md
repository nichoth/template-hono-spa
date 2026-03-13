# Contract: Vite 8 Configuration Compatibility

## Purpose

Define the required observable behavior of the repository configuration after adjusting the project for Vite 8.

## Contract Rules

1. The repository must start local development without configuration-related startup failures when using Vite 8.
2. The repository must keep the existing local development entry point unchanged for contributors.
3. The repository must complete the production build without configuration-related build failures when using Vite 8.
4. The build output location and manifest flow must remain compatible with the current runtime asset-loading behavior.
5. CSS transformation and asset resolution settings must remain valid across both development and production workflows.
6. Environment-specific configuration behavior must not diverge in a way that breaks existing app routes or asset delivery.
7. Compatibility-sensitive settings must remain clear enough that future contributors can identify which parts of the config are version-dependent.
8. Local startup must not depend on the Cloudflare inspector port being available.

## Covered Surfaces

- Repository configuration in [/Users/nick/code/template-hono-spa/vite.config.js](/Users/nick/code/template-hono-spa/vite.config.js)
- Script entry points in [/Users/nick/code/template-hono-spa/package.json](/Users/nick/code/template-hono-spa/package.json)
- Runtime asset resolution in [/Users/nick/code/template-hono-spa/src/server/startup-assets.ts](/Users/nick/code/template-hono-spa/src/server/startup-assets.ts)
- Integration and unit regression coverage in [/Users/nick/code/template-hono-spa/test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts) and [/Users/nick/code/template-hono-spa/test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts)

## Verification

- Automated validation should confirm lint, tests, and production build succeed after the config change.
- Manual validation should confirm the local development server starts and serves existing routes without configuration failures.
- Review should confirm the compatibility-sensitive settings are localized and understandable within the configuration file.
