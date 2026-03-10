# Tasks: HTM Rendering + TS Extension Migration

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/migration-contract.md`, `quickstart.md`

**Tests**: Included. The spec and quickstart require regression verification, and migration safety depends on test-first checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no incomplete dependency overlap)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish migration guardrails and file inventory before code conversion.

- [X] T001 Capture `.tsx` migration inventory in /Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/research.md
- [X] T002 [P] Add temporary migration scan script for JSX/extension checks in /Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/scripts/migration-scan.sh
- [X] T003 [P] Add focused migration test file scaffold in /Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete structural file migration constraints required for all stories.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [X] T004 Rename server entry file from /Users/nick/code/template-hono-spa/src/server/index.tsx to /Users/nick/code/template-hono-spa/src/server/index.ts
- [X] T005 [P] Rename shared app file from /Users/nick/code/template-hono-spa/src/app.tsx to /Users/nick/code/template-hono-spa/src/app.ts
- [X] T006 [P] Rename client entry file from /Users/nick/code/template-hono-spa/src/client/index.tsx to /Users/nick/code/template-hono-spa/src/client/index.ts
- [X] T007 [P] Rename route files from /Users/nick/code/template-hono-spa/src/client/routes/about.tsx and /Users/nick/code/template-hono-spa/src/client/routes/home.tsx to `.ts`
- [X] T008 [P] Rename client not-found file from /Users/nick/code/template-hono-spa/src/client/not-found.tsx to /Users/nick/code/template-hono-spa/src/client/not-found.ts
- [X] T009 [P] Rename component files from /Users/nick/code/template-hono-spa/src/components/*.tsx to `.ts`
- [X] T010 Update imports and explicit source-path references impacted by extension changes in /Users/nick/code/template-hono-spa/src/server/index.ts and /Users/nick/code/template-hono-spa/test/*.ts

**Checkpoint**: Extension migration completed and imports resolve.

---

## Phase 3: User Story 1 - Use one rendering style across client views (Priority: P1) 🎯 MVP

**Goal**: Convert all client rendering modules to one template-literal rendering style.

**Independent Test**: Inspect client rendering modules and confirm no JSX syntax remains while template-literal rendering is used consistently.

### Tests for User Story 1

- [X] T011 [P] [US1] Add failing JSX-detection tests for client modules in /Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts
- [X] T012 [P] [US1] Add failing syntax-style assertions for client render modules in /Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts

### Implementation for User Story 1

- [X] T013 [US1] Convert /Users/nick/code/template-hono-spa/src/client/index.ts to template-literal rendering syntax
- [X] T014 [P] [US1] Convert /Users/nick/code/template-hono-spa/src/client/routes/home.ts and /Users/nick/code/template-hono-spa/src/client/routes/about.ts to template-literal rendering syntax
- [X] T015 [P] [US1] Convert /Users/nick/code/template-hono-spa/src/client/not-found.ts and /Users/nick/code/template-hono-spa/src/app.ts to template-literal rendering syntax
- [X] T016 [P] [US1] Convert /Users/nick/code/template-hono-spa/src/components/button.ts and /Users/nick/code/template-hono-spa/src/components/card.ts to template-literal rendering syntax
- [X] T017 [P] [US1] Convert /Users/nick/code/template-hono-spa/src/components/counter.ts and /Users/nick/code/template-hono-spa/src/components/nav.ts to template-literal rendering syntax
- [X] T018 [US1] Update client rendering contract notes after conversion in /Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/contracts/migration-contract.md

**Checkpoint**: US1 modules are consistently migrated and independently testable.

---

## Phase 4: User Story 2 - Preserve existing user-visible behavior during migration (Priority: P2)

**Goal**: Keep route content, navigation behavior, and server route responses unchanged after migration.

**Independent Test**: Run integration/unit suites and verify route and interaction behavior remains equivalent.

### Tests for User Story 2

- [X] T019 [P] [US2] Add failing route parity assertions for migrated entrypoints in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T020 [P] [US2] Add failing server no-JSX/parity assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 2

- [X] T021 [US2] Remove any remaining JSX syntax from /Users/nick/code/template-hono-spa/src/server/index.ts while preserving response behavior
- [X] T022 [US2] Align development shell asset/module references with renamed `.ts` files in /Users/nick/code/template-hono-spa/src/server/index.ts
- [X] T023 [US2] Fix regression issues discovered by parity tests in /Users/nick/code/template-hono-spa/src/client/index.ts and /Users/nick/code/template-hono-spa/src/components/nav.ts

**Checkpoint**: US2 behavior parity validated independently.

---

## Phase 5: User Story 3 - Align client patterns with reference templates (Priority: P3)

**Goal**: Ensure migrated client modules follow consistent reference-style structure for maintainability.

**Independent Test**: Compare representative migrated modules against the defined template-literal pattern checklist and confirm consistency.

### Tests for User Story 3

- [X] T024 [P] [US3] Add failing style-consistency checks for representative modules in /Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts

### Implementation for User Story 3

- [X] T025 [US3] Normalize helper bindings/import patterns in /Users/nick/code/template-hono-spa/src/client/index.ts and /Users/nick/code/template-hono-spa/src/components/button.ts
- [X] T026 [P] [US3] Normalize component/template organization in /Users/nick/code/template-hono-spa/src/components/card.ts and /Users/nick/code/template-hono-spa/src/components/nav.ts
- [X] T027 [P] [US3] Document reference-aligned rendering conventions in /Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/research.md

**Checkpoint**: US3 style alignment validated independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and project-wide cleanup.

- [X] T028 [P] Run full regression suite and fix remaining failures in /Users/nick/code/template-hono-spa/test/integration.spec.ts and /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [X] T029 [P] Run migration syntax scan and remove temporary false positives in /Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/scripts/migration-scan.sh
- [X] T030 Validate quickstart commands and update final steps in /Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/quickstart.md
- [X] T031 Record final success-criteria evidence in /Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; recommended after US1 for safer parity validation.
- **Phase 5 (US3)**: Depends on Phase 2; recommended after US1 since it normalizes migrated patterns.
- **Phase 6 (Polish)**: Depends on completed story phases.

### User Story Dependencies

- **US1 (P1)**: No story dependency after foundational migration.
- **US2 (P2)**: Depends on foundational migration; naturally validates outcomes of US1 changes.
- **US3 (P3)**: Depends on having migrated client modules (US1 baseline) for alignment work.

### Dependency Graph

- `Setup -> Foundational -> US1 -> {US2, US3} -> Polish`

### Within Each User Story

- Write failing tests first.
- Implement minimal changes to satisfy tests.
- Re-run story tests before advancing.

---

## Parallel Execution Examples

## Parallel Example: User Story 1

```bash
Task T014: Convert client route modules in /Users/nick/code/template-hono-spa/src/client/routes/
Task T016: Convert button/card components in /Users/nick/code/template-hono-spa/src/components/
Task T017: Convert counter/nav components in /Users/nick/code/template-hono-spa/src/components/
```

## Parallel Example: User Story 2

```bash
Task T019: Add route parity assertions in /Users/nick/code/template-hono-spa/test/integration.spec.ts
Task T020: Add server parity assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts
```

## Parallel Example: User Story 3

```bash
Task T026: Normalize style structure in /Users/nick/code/template-hono-spa/src/components/card.ts and nav.ts
Task T027: Update reference style notes in /Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/research.md
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 migration tasks.
3. Validate syntax consistency and no client JSX remnants.
4. Demo MVP rendering migration.

### Incremental Delivery

1. Deliver US1 syntax conversion.
2. Deliver US2 behavior-parity protections.
3. Deliver US3 style normalization.
4. Finish with full polish verification.

### Parallel Team Strategy

1. Complete setup/foundational together.
2. Assign one engineer to parity safeguards (US2) and one to style normalization (US3) after US1 baseline.
3. Merge only after phase checkpoints pass.

---

## Notes

- `[P]` tasks are parallel-safe only if they avoid same-file edits.
- User-story labeling preserves traceability to spec priorities.
- Each story has an independent test gate before advancing.
