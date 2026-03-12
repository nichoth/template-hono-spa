# Contract: Test Type Validation

## Purpose

Define the expected verification surface for the "fix test file type errors" feature.

## Inputs

- The existing test files in `test/`
- The repository TypeScript configuration and any test-specific validation configuration introduced for this feature
- Existing worker-test dependencies and runtime bindings already installed in the repo

## Required Outputs

1. The validation command `npm run test:typecheck` reports zero TypeScript diagnostics for:
   - `test/integration.spec.ts`
   - `test/migration-rendering.spec.ts`
   - `test/unit.spec.ts`
2. The automated test suite still executes these files without removing their current assertions.
3. Any remaining diagnostics outside the contract scope are listed explicitly in developer-facing documentation.

## Rules

- The contract covers test-file typing only; it does not require the entire repository to become type-clean.
- Shared config or source may be changed only when required to satisfy the contract for the listed test files.
- Unsupported broad `any` escapes do not satisfy the contract unless no typed package or local source contract is available.

## Verification

- Run `npm run test:typecheck`.
- Run `npm test`.
- Record any remaining non-test diagnostics separately from contract pass/fail.
- Treat failures from the root `tsconfig.json` as out of scope unless they originate from files under `test/`.
