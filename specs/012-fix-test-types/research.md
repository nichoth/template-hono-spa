# Phase 0 Research

## Decision 1: Add the Cloudflare Vitest worker types explicitly to the TypeScript validation path

**Decision**: Treat `@cloudflare/vitest-pool-workers` as an explicit TypeScript input for test validation instead of relying on ambient discovery.

**Rationale**: The installed package exposes `SELF`, `env`, `createExecutionContext`, and `waitOnExecutionContext` through its own type declaration file, but the current `tsconfig.json` restricts `compilerOptions.types` to `vite/client` and `@cloudflare/workers-types`. That exclusion explains why the test files currently report missing exports from `cloudflare:test`.

**Alternatives considered**:

- Remove the `types` allowlist entirely. Rejected because it broadens the compiler environment for the whole repo and increases the chance of unrelated global-type drift.
- Add handwritten local declarations for `cloudflare:test`. Rejected because the package already provides the authoritative type surface, and duplicating it would be brittle.

## Decision 2: Use a test-focused validation path instead of treating unrelated application diagnostics as part of this feature

**Decision**: Validate test typing through a dedicated test-oriented TypeScript path that covers the files in `test/` and their imported dependencies.

**Rationale**: A full `npx tsc --noEmit` run currently reports unrelated errors in `src/app.ts`, which are outside the user request. The feature should prove that all test files are type-clean without forcing a broad application typing cleanup. A dedicated test validation path preserves scope while still checking the imported modules that the tests depend on.

**Alternatives considered**:

- Fix every current repository TypeScript error. Rejected because it expands the feature beyond test files.
- Ignore the unrelated application diagnostics and rely only on runtime tests. Rejected because the request is specifically about type errors.

## Decision 3: Update outdated test call sites to match current source signatures

**Decision**: Correct test code that no longer matches the source API surface, including route helper signatures and test-environment access patterns.

**Rationale**: `test/unit.spec.ts` calls `createRouter()` with no argument even though the current source signature expects an application state value. The tests should use supported public signatures or a small typed helper that constructs the required input, rather than bypassing the mismatch with unsafe casts.

**Alternatives considered**:

- Loosen source signatures just to satisfy tests. Rejected because it would change production code contracts for a test-maintenance task.
- Silence errors with broad `any` casts. Rejected because it resolves the symptom but preserves weak typing.

## Decision 4: Keep non-test changes minimal and document any remaining out-of-scope diagnostics

**Decision**: Allow support changes in config or shared source only when they are directly required for test-file type validation, and record unrelated remaining diagnostics explicitly.

**Rationale**: The request targets test files. Minimal support changes are sometimes necessary, but the implementation should not become a general cleanup pass.

**Alternatives considered**:

- Ban all non-test changes. Rejected because test typing may depend on shared configuration.
- Permit opportunistic cleanup while touching nearby code. Rejected because it increases risk and hides the feature’s real scope.

## Implementation Notes

- Added `/Users/nick/code/template-hono-spa/tsconfig.test.json` to validate only the test files and their imported dependencies with `@cloudflare/vitest-pool-workers` types enabled.
- Added `npm run test:typecheck` in `/Users/nick/code/template-hono-spa/package.json` as the repeatable validation entry point.
- Strengthened `/Users/nick/code/template-hono-spa/test/env.d.ts` so the Cloudflare test environment exposes the worker bindings used by the tests.
- Updated `/Users/nick/code/template-hono-spa/test/unit.spec.ts` to pass an explicit `AppState` into `createRouter(...)` instead of relying on an outdated zero-argument call.
- No broader source refactor was required; the production code under `src/` was left unchanged for this feature.
