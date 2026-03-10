# Contract: Rendering Migration Interface

## Scope
Defines observable migration requirements for source syntax and runtime behavior.

## Implementation Notes (Current Iteration)
- Client rendering modules in scope are expected to use `html\`\`` template-literal rendering.
- Server entry module is expected to remain JSX-free with `.ts` extension.
- Validation is enforced by `test/migration-rendering.spec.ts`, `test/integration.spec.ts`, and `test/unit.spec.ts`.

## File System Contract
1. Modules in migration scope must no longer exist as `.tsx` files.
2. Replacement modules must exist as `.ts` files at corresponding paths.
3. Importers must reference valid post-migration module paths.

## Server Contract
1. Server entry modules in scope must not contain JSX syntax.
2. Existing server routes (`/api/health`, `/health`, app shell behavior) must continue to return expected status codes and response types.

## Client Rendering Contract
1. Client rendering modules in scope must use template-literal rendering style.
2. Baseline route content and interaction outcomes must remain equivalent.

## Acceptance Contract Scenarios
1. Extension migration:
   - Input: repository scan for `src/**/*.tsx`
   - Expected: zero matches for migrated scope.
2. Server JSX removal:
   - Input: syntax scan of server entry modules
   - Expected: no JSX tokens remain.
3. Runtime parity:
   - Input: existing test suites and targeted regression checks
   - Expected: test pass with no behavior regression.
