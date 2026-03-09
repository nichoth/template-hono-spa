# Phase 0 Research: Client-Only Rendering

## Decision: Remove server-rendered page body content for app routes

- **Decision**: Page routes should return a client shell only (mount container + script/style references), with no server-rendered application UI.
- **Rationale**: The feature explicitly requires 100% client-side rendering and removal of server-side render related behavior.
- **Alternatives considered**:
  - Keep partial SSR for selected routes: rejected because it violates client-only rendering requirement.
  - Keep SSR but hide server-rendered markup: rejected because SSR logic would still exist and remain a maintenance path.

## Decision: Preserve startup reliability independent of generated SSR artifacts

- **Decision**: Startup flow should avoid dependence on server-render specific generated artifacts.
- **Rationale**: Local startup must remain reliable after SSR path removal, especially for clean workspaces.
- **Alternatives considered**:
  - Require pre-generation before startup: rejected due added friction and regressions in onboarding.
  - Commit generated artifacts permanently: rejected due drift and maintenance overhead.

## Decision: Keep actionable failure messages for startup prerequisites

- **Decision**: Standardize startup errors to include clear cause and concrete remediation guidance.
- **Rationale**: Client-only migration should not degrade diagnostics; explicit remediation supports faster recovery.
- **Alternatives considered**:
  - Pass through raw runtime errors only: rejected as non-actionable for many contributors.
  - Suppress failures and continue: rejected because hidden failures complicate debugging.

## Decision: Revalidate route behavior with user-visible tests

- **Decision**: Verify shell-only route responses and retained interactivity through existing unit/integration testing strategy.
- **Rationale**: User stories require independently testable proof that no server-rendered UI remains and startup still works.
- **Alternatives considered**:
  - Manual-only verification: rejected for low repeatability.
  - Unit-only checks: rejected because route behavior requires integration-level assertions.

## Clarification Resolution Status

All technical context uncertainties resolved:
- Rendering mode is client-only across primary page routes.
- Startup behavior remains command-compatible.
- Failure diagnostics remain explicit and actionable.
