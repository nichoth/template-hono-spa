# Phase 0 Research: Login Radio Style

## Decision 1: Keep the existing `radio-input` control and refine only its surrounding presentation

- **Decision**: Reuse the already-integrated radio-input custom element on `/login` and focus implementation on matching the referenced create-account visual treatment through surrounding layout and styling changes.
- **Rationale**: The current code already uses the required custom element. The new feature request is about how it should look in context, not about changing the selector technology again.
- **Alternatives considered**:
  - Replace the current selector with a custom-built radio UI wrapper: rejected because the user explicitly wants the radio-input custom element.
  - Leave the selector as-is and only update copy: rejected because the request is specifically about closer visual alignment to the reference pattern.

## Decision 2: Preserve route-local sign-in selection state and current passkey/password behaviors

- **Decision**: Keep sign-in method selection local to [src/client/routes/login.ts](/Users/nick/code/template-hono-spa/src/client/routes/login.ts) and preserve the current passkey action, password validation, and fallback behavior while changing selector presentation.
- **Rationale**: The current login route already supports method switching through route-local state. The requested change is a styling and presentation refinement, not a change to broader application state or authentication scope.
- **Alternatives considered**:
  - Move selector state into shared app state: rejected because no other route consumes it.
  - Redesign passkey and password flows together with the visual refresh: rejected because that would expand the request beyond selector presentation.

## Decision 3: Model “visual parity” as concrete layout and state expectations in docs and tests

- **Decision**: Treat the shared reference pattern as a set of observable expectations for option grouping, spacing, selected-state clarity, and selector persistence while the method-specific content changes.
- **Rationale**: The spec must stay implementation-agnostic, but the plan needs concrete criteria that developers and reviewers can apply. Translating the reference into testable presentation expectations keeps the work scoped and reviewable.
- **Alternatives considered**:
  - Describe the reference only in subjective terms: rejected because that would make the task hard to validate consistently.
  - Require pixel-perfect matching: rejected because the login route has different surrounding content and should remain consistent rather than artificially identical.

## Decision 4: Extend the existing unit and worker integration seams instead of adding a new UI harness

- **Decision**: Use the established unit-source assertions in [test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and shell-level route checks in [test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts) to protect the selector structure and route stability.
- **Rationale**: The repository already validates route behavior and source-level regressions with Vitest. This feature only changes one route’s structure and presentation, so the current testing seams are sufficient.
- **Alternatives considered**:
  - Introduce browser automation for this change: rejected because the current repository workflow does not depend on it.
  - Rely on manual visual review only: rejected because selector regressions should be caught automatically as part of the normal test run.
