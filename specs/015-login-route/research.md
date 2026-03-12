# Phase 0 Research: Login Route

## Decision 1: Keep `/login` as a client-managed route with shell deep-link support

- **Decision**: Implement `/login` through the existing client router and route metadata, relying on the current app-shell handling for direct browser requests.
- **Rationale**: The current application already serves the shell for app-page routes and resolves client views through [src/client/routes/index.ts](/Users/nick/code/template-hono-spa/src/client/routes/index.ts). Adding `/login` to that same route registry keeps route ownership consistent and preserves deep-link behavior already covered in shell tests.
- **Alternatives considered**:
  - Add a dedicated server-rendered `/login` page: rejected because the spec is explicitly UI-only and the current app is client-rendered.
  - Leave `/login` out of centralized route metadata: rejected because navigation and known-route checks are already centralized and should remain so.

## Decision 2: Register and style the requested Substrate web components through the existing client/bootstrap pattern

- **Decision**: Use the existing client bootstrap and global stylesheet to wire the requested components: keep `SubstrateButton.define()` in the client entry, import `@substrate-system/input` and `@substrate-system/password-input` for custom-element registration, and add the corresponding component CSS imports in [src/style.css](/Users/nick/code/template-hono-spa/src/style.css).
- **Rationale**: The installed packages expose browser-ready web components that self-register on import for `input` and `password-input`, while `button` uses explicit `.define()`. This matches the current project pattern where the client entry registers custom elements and the shared stylesheet imports component CSS once for the whole app.
- **Alternatives considered**:
  - Register components inside the login route module only: rejected because custom-element definition is a bootstrap concern and should not be repeated per route render.
  - Use native inputs instead of the requested components: rejected because it would violate the user requirement and create inconsistent UI styling.

## Decision 3: Keep login interaction state local to the route instead of expanding global app state

- **Decision**: Manage field values, validation feedback, and submit status inside the `/login` route component rather than extending [src/client/state.ts](/Users/nick/code/template-hono-spa/src/client/state.ts).
- **Rationale**: The feature is a single-form, UI-only route with no shared authentication session, no server calls, and no cross-route state dependency. Local route state keeps the implementation small and avoids coupling temporary form behavior to the broader app state model.
- **Alternatives considered**:
  - Add login form state to the global `AppState`: rejected because no other route depends on it.
  - Store intermediate values in URL parameters: rejected because login form entry is ephemeral and should not be encoded into navigation state.

## Decision 4: Test the feature through existing route, shell, and validation coverage layers

- **Decision**: Extend the current unit and integration suites instead of introducing a new test harness.
- **Rationale**: [test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) already verifies centralized route metadata and route matching, while [test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts) already verifies shell behavior for direct route requests. The new feature fits those existing coverage seams.
- **Alternatives considered**:
  - Add browser automation for the login form: rejected for now because the repo currently validates client behavior through Vitest unit and worker integration tests.
  - Rely on manual checks only: rejected because the feature changes route behavior and should be protected against regressions.
