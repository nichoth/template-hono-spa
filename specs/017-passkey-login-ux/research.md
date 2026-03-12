# Phase 0 Research: Passkey Login UX

## Decision 1: Use a direct passkey action with a visible password fallback instead of a radio-button selector

- **Decision**: Present passkey sign-in as a primary action on the login screen and keep password sign-in available as a visible secondary path, rather than asking users to choose between passkey and password via radio buttons.
- **Rationale**: The passkey path is action-oriented and can be started immediately, while a radio control adds an extra interpretation step before the user understands what to do next. A direct action reduces hesitation for passkey-capable users and keeps the password path understandable for everyone else.
- **Alternatives considered**:
  - Use radio buttons to toggle between password and passkey modes: rejected because it makes users choose a technical mode before they see the most relevant next step.
  - Keep both passkey and password fields visible at once: rejected because it risks a mixed-state interface and weakens clarity around which method is active.

## Decision 2: Keep the login route UI-only and model passkey as a route-local interaction state first

- **Decision**: Extend the current route-local login state to represent an active sign-in method and passkey-attempt state without expanding the global app state.
- **Rationale**: The existing login route is already UI-only and self-contained. Adding login-method state locally preserves that boundary and keeps the UX iteration small while still allowing tests to cover method switching and submission behavior.
- **Alternatives considered**:
  - Move login-method state into shared global state: rejected because no other route currently depends on it.
  - Introduce backend auth flow planning here: rejected because the spec is scoped to login-screen UX, not broader authentication architecture.

## Decision 3: Make method switching explicit through screen content, not only through control chrome

- **Decision**: When the active method changes, update the visible controls, supporting copy, and primary action label so users can tell which path is active from multiple cues.
- **Rationale**: The spec prioritizes comprehension and fallback. Relying on a single visual selector is fragile, especially for users unfamiliar with passkeys. Redundant cues reduce ambiguity and support independent testing of the active-method state.
- **Alternatives considered**:
  - Use a single selector highlight without changing the rest of the form: rejected because it leaves too much of the cognitive burden on the user.
  - Route passkey users to a separate page: rejected because it adds navigation overhead and weakens the fallback path.

## Decision 4: Extend current unit and worker integration coverage instead of introducing a new UI test harness

- **Decision**: Add route-level source assertions and behavioral tests in the existing Vitest suites for the passkey entry point, active-method visibility, and password fallback.
- **Rationale**: The repository already verifies login-route structure and UI-only form behavior through [test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and route shell behavior through [test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts). The new UX fits those existing seams.
- **Alternatives considered**:
  - Add browser automation for this change first: rejected because the existing project relies on Vitest and worker integration tests for route validation.
  - Rely on manual review only: rejected because the active-method UX can regress silently without automated coverage.
