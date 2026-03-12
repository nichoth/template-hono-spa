# Tasks: Fix Test File Type Errors

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/012-fix-test-types/`
**Prerequisites**: [plan.md](/Users/nick/code/template-hono-spa/specs/012-fix-test-types/plan.md), [spec.md](/Users/nick/code/template-hono-spa/specs/012-fix-test-types/spec.md), [research.md](/Users/nick/code/template-hono-spa/specs/012-fix-test-types/research.md), [data-model.md](/Users/nick/code/template-hono-spa/specs/012-fix-test-types/data-model.md), [test-type-validation.md](/Users/nick/code/template-hono-spa/specs/012-fix-test-types/contracts/test-type-validation.md), [quickstart.md](/Users/nick/code/template-hono-spa/specs/012-fix-test-types/quickstart.md)

**Tests**: Verification tasks are included because the specification explicitly requires preserving existing test behavior and proving the targeted type validation path.

**Organization**: Tasks are grouped by user story to keep each increment independently testable.

## Phase 1: Setup

**Purpose**: Confirm the current failure surface and establish the task execution baseline.

- [X] T001 Capture the current TypeScript baseline for `test/integration.spec.ts`, `test/unit.spec.ts`, and `src/app.ts` in `/Users/nick/code/template-hono-spa/specs/012-fix-test-types/quickstart.md`
- [X] T002 Review the current compiler and worker-test configuration in `/Users/nick/code/template-hono-spa/tsconfig.json` and `/Users/nick/code/template-hono-spa/vitest.config.ts`

---

## Phase 2: Foundational

**Purpose**: Create the repeatable test-focused validation path that blocks all user stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T003 Create a dedicated test-only TypeScript configuration in `/Users/nick/code/template-hono-spa/tsconfig.test.json`
- [X] T004 Update the repeatable test typecheck command in `/Users/nick/code/template-hono-spa/package.json`
- [X] T005 Align the validation contract wording with the dedicated test typecheck path in `/Users/nick/code/template-hono-spa/specs/012-fix-test-types/contracts/test-type-validation.md`

**Checkpoint**: The repo has a single, repeatable command for validating the test files independently of unrelated application diagnostics.

---

## Phase 3: User Story 1 - Restore Test Type Safety (Priority: P1) 🎯 MVP

**Goal**: Remove all TypeScript diagnostics from the three existing test files.

**Independent Test**: Run the dedicated test typecheck command and confirm zero diagnostics for `test/integration.spec.ts`, `test/migration-rendering.spec.ts`, and `test/unit.spec.ts`.

- [X] T006 [P] [US1] Update Cloudflare worker test imports and environment typing in `/Users/nick/code/template-hono-spa/test/integration.spec.ts`
- [X] T007 [US1] Update Cloudflare worker test imports and execution-context typing in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`
- [X] T008 [US1] Reconcile the route helper call used by `/Users/nick/code/template-hono-spa/test/unit.spec.ts` with the current signature in `/Users/nick/code/template-hono-spa/src/client/routes/index.ts`
- [X] T009 [P] [US1] Confirm or adjust import-glob typing under the new validation path in `/Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts`
- [X] T010 [US1] Run the dedicated test typecheck against `/Users/nick/code/template-hono-spa/test/integration.spec.ts`, `/Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts`, and `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

**Checkpoint**: User Story 1 is complete when all targeted test files are type-clean.

---

## Phase 4: User Story 2 - Preserve Existing Test Intent (Priority: P2)

**Goal**: Keep the same behavioral coverage after the typing fixes.

**Independent Test**: Run the automated test suite and confirm the targeted test files still execute their current assertions.

- [X] T011 [P] [US2] Verify behavioral coverage still passes for `/Users/nick/code/template-hono-spa/test/integration.spec.ts` with the existing `npm test` workflow
- [X] T012 [P] [US2] Verify behavioral coverage still passes for `/Users/nick/code/template-hono-spa/test/unit.spec.ts` and `/Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts` with the existing `npm test` workflow
- [X] T013 [US2] Confirm no behavior-preserving assertion updates are needed after the type cleanup in `/Users/nick/code/template-hono-spa/test/integration.spec.ts` and `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

**Checkpoint**: User Story 2 is complete when the type fixes do not weaken or remove current test intent.

---

## Phase 5: User Story 3 - Limit Scope of Supporting Changes (Priority: P3)

**Goal**: Keep non-test edits minimal and explicitly justify any required support changes.

**Independent Test**: Review the final diff and confirm non-test changes are limited to typing support for the test files.

- [X] T014 [US3] Apply only minimal support changes required by the test files in `/Users/nick/code/template-hono-spa/src/client/routes/index.ts` or `/Users/nick/code/template-hono-spa/tsconfig.test.json`
- [X] T015 [US3] Record the reason for every non-test supporting change in `/Users/nick/code/template-hono-spa/specs/012-fix-test-types/research.md`
- [X] T016 [US3] Document any remaining out-of-scope non-test TypeScript diagnostics in `/Users/nick/code/template-hono-spa/specs/012-fix-test-types/quickstart.md`

**Checkpoint**: User Story 3 is complete when scope boundaries are explicit and defensible.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all stories.

- [X] T017 [P] Update the final verification steps and expected pass criteria in `/Users/nick/code/template-hono-spa/specs/012-fix-test-types/contracts/test-type-validation.md`
- [X] T018 Run final end-to-end validation for `/Users/nick/code/template-hono-spa/package.json`, `/Users/nick/code/template-hono-spa/tsconfig.test.json`, and `/Users/nick/code/template-hono-spa/test/*.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) starts immediately.
- Foundational (Phase 2) depends on Setup and blocks all user stories.
- User Story 1 (Phase 3) depends on Foundational completion.
- User Story 2 (Phase 4) depends on User Story 1 because runtime verification only makes sense after the targeted files type-check.
- User Story 3 (Phase 5) depends on User Story 1 and can overlap with late User Story 2 verification if no additional code changes are introduced.
- Polish (Phase 6) depends on the desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories; this is the MVP.
- **US2 (P2)**: Depends on US1’s typing fixes being in place.
- **US3 (P3)**: Depends on knowing which non-test files changed during US1.

### Dependency Graph

`Setup -> Foundational -> US1 -> US2 -> US3 -> Polish`

## Parallel Opportunities

- Phase 3: `T006` and `T009` can run in parallel because they touch different test files.
- Phase 4: `T011` and `T012` can run in parallel because they verify different test targets.
- Phase 6: `T017` can run in parallel with final command execution once story work is stable.

## Parallel Example: User Story 1

```bash
Task: "Update Cloudflare worker test imports and environment typing in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
Task: "Confirm or adjust import-glob typing under the new validation path in /Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Verify behavioral coverage still passes for /Users/nick/code/template-hono-spa/test/integration.spec.ts with the existing npm test workflow"
Task: "Verify behavioral coverage still passes for /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts with the existing npm test workflow"
```

## Parallel Example: User Story 3

```bash
Task: "Apply only minimal support changes required by the test files in /Users/nick/code/template-hono-spa/src/client/routes/index.ts or /Users/nick/code/template-hono-spa/tsconfig.test.json"
Task: "Record the reason for every non-test supporting change in /Users/nick/code/template-hono-spa/specs/012-fix-test-types/research.md"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 to make all test files type-clean.
3. Validate the dedicated test typecheck path before moving on.

### Incremental Delivery

1. Build the dedicated validation path.
2. Fix the test-file typing issues.
3. Confirm runtime behavior still passes.
4. Document scope boundaries and remaining out-of-scope diagnostics.

### Suggested MVP Scope

Complete only User Story 1 after the foundational phase if the immediate goal is to satisfy the original request as narrowly as possible.

## Notes

- All tasks use the required checklist format with task ID, optional `[P]`, optional story label, and explicit file paths.
- No new tests are introduced; verification uses the existing typecheck and test workflows required by the feature spec.
- User Story phases are ordered by the priorities defined in the specification.
