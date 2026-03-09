# Phase 0 Research: Reliable Local Dev Startup

## Decision 1: Do not hard-fail local dev startup on missing built manifest

- **Decision**: Treat built manifest data as production-only input, and avoid requiring `public/client/vite-manifest.json` for local dev startup.
- **Rationale**: The current startup error is triggered by importing a build artifact in server runtime during `npm start`. Fresh checkouts do not guarantee that artifact exists, which violates FR-001/FR-002.
- **Alternatives considered**:
  - Keep static manifest import and require prebuild before `npm start`: rejected because it contradicts documented local dev flow and blocks onboarding.
  - Commit generated manifest into source control: rejected because generated artifacts drift and create maintenance noise.

## Decision 2: Align startup behavior and documentation around one canonical dev entrypoint

- **Decision**: Keep `npm start` as the canonical local dev entrypoint and ensure docs and runtime behavior both match that expectation.
- **Rationale**: The feature intent is explicit: `npm start` should start local server. Consistency between command behavior and README reduces support burden (FR-004/FR-006).
- **Alternatives considered**:
  - Introduce new dev command and deprecate `npm start`: rejected because it adds migration friction and does not solve the immediate usability issue.
  - Require separate setup scripts before every start: rejected because it increases cognitive load and startup latency.

## Decision 3: Standardize actionable startup error messaging for unrecoverable cases

- **Decision**: For truly unrecoverable startup prerequisites, provide explicit cause plus concrete remediation command/step.
- **Rationale**: FR-005 and User Story 3 require diagnostics that reduce troubleshooting time; generic stack traces are insufficient.
- **Alternatives considered**:
  - Emit raw runtime exception only: rejected because it is ambiguous for new contributors.
  - Suppress errors and continue partial startup: rejected because silent degradation hides real issues and complicates debugging.

## Decision 4: Validate with integration coverage centered on developer-observable outcomes

- **Decision**: Add/adjust tests to confirm startup succeeds in clean-like conditions and that fallback/error paths are user-actionable.
- **Rationale**: Success criteria are user-facing; testing should verify command-level outcomes rather than internal implementation.
- **Alternatives considered**:
  - Rely on manual verification only: rejected because regressions would recur unnoticed.
  - Test only low-level helper functions: rejected because it misses end-to-end startup behavior.

## Decision 5: Serve a client-rendered shell only (no server-side app rendering)

- **Decision**: Return an HTML shell with empty `#root`, client script tags, and initial state; do not server-render app components.
- **Rationale**: Explicit user requirement disallows server-side rendering for this feature work.
- **Alternatives considered**:
  - Continue SSR with hydration: rejected due direct requirement conflict.
  - Hybrid SSR on some routes only: rejected to keep startup behavior consistent and predictable.

## Clarification Resolution Status

All technical-context unknowns are resolved for planning:
- Startup artifact dependency handling: resolved
- Canonical startup command behavior: resolved
- Failure UX expectation for prerequisites: resolved
