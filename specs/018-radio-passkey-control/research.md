# Phase 0 Research: Radio Passkey Control

## Decision 1: Replace the current toggle-style method switch with a radio-button selector

- **Decision**: Present passkey and password through a radio-button control that keeps both methods visible together and makes selection explicit before the corresponding login controls are shown.
- **Rationale**: The user request specifically points to a radio-input pattern and provides an example. Matching that pattern reduces ambiguity about the desired UX direction and makes method selection feel consistent with the referenced sign-up screen.
- **Alternatives considered**:
  - Keep the existing button-toggle approach: rejected because it no longer matches the requested interaction pattern.
  - Hide method selection behind secondary links only: rejected because it would make comparison between passkey and password less explicit.

## Decision 2: Reuse the current route-local login-method state and adapt it to drive the radio group

- **Decision**: Keep sign-in method state local to [src/client/routes/login.ts](/Users/nick/code/template-hono-spa/src/client/routes/login.ts) and use it as the source of truth for which radio option is selected and which login controls are visible.
- **Rationale**: The existing passkey/password UX is already route-local and UI-only. The new requirement changes the selector pattern, not the need for broader shared state.
- **Alternatives considered**:
  - Move login-method state into shared global state: rejected because the `/login` route remains the only consumer.
  - Split passkey and password into separate routes: rejected because the spec requires both methods within one radio-button control group on the same screen.

## Decision 3: Keep passkey and password behaviors intact while changing only the method selector pattern

- **Decision**: Preserve the current passkey-attempt and password-fallback behaviors, but make radio selection the control that activates each method.
- **Rationale**: The new feature request is about the selector UI. Reusing the existing UI-only passkey and password flows minimizes scope and keeps the implementation aligned with the current login-route boundary.
- **Alternatives considered**:
  - Redesign the underlying passkey and password flows at the same time: rejected because it would expand scope beyond the requested control change.
  - Remove the currently active method-specific copy and rely on radio selection alone: rejected because users still need context about what happens next after making a selection.

## Decision 4: Extend current unit and worker integration coverage around radio selection instead of adding a new UI test harness

- **Decision**: Add unit and integration coverage to verify the radio selector, active-method state, passkey path visibility, and password fallback.
- **Rationale**: The repository already validates login-route behavior via [test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and app-shell routing via [test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts). The selector change fits those existing seams.
- **Alternatives considered**:
  - Add browser automation first: rejected because the current repo’s established test strategy is Vitest-based.
  - Rely on manual review only: rejected because selector-state regressions can be subtle and should be protected automatically.
