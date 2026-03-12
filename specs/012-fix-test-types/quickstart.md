# Quickstart

## 1. Inspect the current baseline

Run the full repository typecheck once to capture unrelated noise and confirm the current test-file failures:

```bash
npx tsc --noEmit --pretty false
```

Observed baseline on 2026-03-11:

- `test/integration.spec.ts` cannot resolve exported members from `cloudflare:test`
- `test/unit.spec.ts` cannot resolve exported members from `cloudflare:test`
- `test/unit.spec.ts` calls `createRouter()` with an outdated signature
- `src/app.ts` also reports unrelated diagnostics outside this feature scope

The initial `npx tsc --noEmit --pretty false` output starts with:

```text
src/app.ts(7,21): error TS2307: Cannot find module './components/nav.js' or its corresponding type declarations.
src/app.ts(9,16): error TS2554: Expected 1 arguments, but got 0.
test/integration.spec.ts(1,10): error TS2305: Module '"cloudflare:test"' has no exported member 'SELF'.
test/integration.spec.ts(1,16): error TS2305: Module '"cloudflare:test"' has no exported member 'env'.
test/unit.spec.ts(2,5): error TS2305: Module '"cloudflare:test"' has no exported member 'env'.
test/unit.spec.ts(3,5): error TS2305: Module '"cloudflare:test"' has no exported member 'createExecutionContext'.
test/unit.spec.ts(4,5): error TS2305: Module '"cloudflare:test"' has no exported member 'waitOnExecutionContext'.
test/unit.spec.ts(148,28): error TS2554: Expected 1 arguments, but got 0.
```

## 2. Implement the test-focused validation path

Introduce or update configuration so TypeScript validates the files under `test/` with the Cloudflare worker test types included. The dedicated validation command is `npm run test:typecheck`.

## 3. Fix the test-file type mismatches

Update the test files and any minimal supporting config or source typing needed so the validation path reports zero diagnostics for every file in `test/`.

## 4. Verify behavior remains intact

Run:

```bash
npm test
```

## 5. Record scope boundaries

The dedicated command `npm run test:typecheck` is the pass/fail gate for this feature.

As of 2026-03-11, the broader command `npx tsc --noEmit --pretty false` still reports out-of-scope diagnostics including:

- `src/app.ts(7,21): error TS2307` for `./components/nav.js`
- `src/app.ts(9,16): error TS2554` for the zero-argument `createRouter()` call
- missing `cloudflare:test` exports under the main repository `tsconfig.json`, which intentionally does not include `@cloudflare/vitest-pool-workers`

Those full-repository diagnostics do not block completion of this feature because the scope is limited to making files under `test/` type-clean and preserving their runtime behavior.
