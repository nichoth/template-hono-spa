# Tasks: Client-Only Rendering

**Input**: Design documents from `/specs/002-remove-ssr/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the specification explicitly defines independent test criteria and acceptance scenarios for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare project context and verification baselines for client-only rendering work.

- [X] T001 Confirm feature scope and acceptance criteria in /Users/nick/code/template-hono-spa/specs/002-remove-ssr/spec.md
- [X] T002 Record baseline route/startup behavior notes in /Users/nick/code/template-hono-spa/specs/002-remove-ssr/research.md
- [X] T003 [P] Ensure quickstart validation commands are executable in /Users/nick/code/template-hono-spa/specs/002-remove-ssr/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared startup/rendering infrastructure before any user story implementation.

**⚠️ CRITICAL**: No user story implementation starts until this phase completes.

- [X] T004 Define shared client-shell response baseline for page routes in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T005 [P] Harden startup asset resolution fallback behavior in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts
- [X] T006 [P] Standardize startup diagnostic formatting behavior in /Users/nick/code/template-hono-spa/src/server/startup-errors.ts
- [X] T007 Add foundational startup helper unit coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Load App Without Server-Rendered UI (Priority: P1) 🎯 MVP

**Goal**: Serve client-shell responses only and remove server-rendered app UI paths.

**Independent Test**: Start app and verify `/` and `/about` responses include shell container/scripts and exclude server-rendered UI content.

### Tests for User Story 1

- [X] T008 [P] [US1] Add integration assertions for shell-only page responses in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T009 [P] [US1] Add unit assertions that route handlers exclude server-rendered app body content in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 1

- [X] T010 [US1] Remove server-rendered page content path from route handling in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T011 [US1] Return client-shell HTML payload for primary routes in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T012 [US1] Remove stale UI copy that implies server rendering in /Users/nick/code/template-hono-spa/src/app.tsx
- [X] T013 [US1] Update client-only rendering documentation in /Users/nick/code/template-hono-spa/README.md

**Checkpoint**: US1 independently functional and testable.

---

## Phase 4: User Story 2 - Keep Startup Reliable After Removing SSR Paths (Priority: P2)

**Goal**: Maintain reliable startup from clean workspace without SSR artifact dependency.

**Independent Test**: From clean workspace state, run startup command and verify valid route responses without manual SSR artifact preparation.

### Tests for User Story 2

- [X] T014 [P] [US2] Add integration scenario for clean-workspace startup reliability in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T015 [P] [US2] Add unit coverage for missing-artifact startup fallback paths in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 2

- [X] T016 [US2] Ensure startup route path is decoupled from SSR-generated artifacts in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T017 [US2] Align worker test configuration for startup reliability checks in /Users/nick/code/template-hono-spa/vitest.config.ts
- [X] T018 [US2] Maintain dedicated worker test config assumptions for local validation in /Users/nick/code/template-hono-spa/wrangler.test.jsonc
- [X] T019 [US2] Document clean-start reliability expectations in /Users/nick/code/template-hono-spa/specs/002-remove-ssr/quickstart.md

**Checkpoint**: US2 independently functional and testable.

---

## Phase 5: User Story 3 - Keep Failure Output Actionable (Priority: P3)

**Goal**: Keep startup prerequisite failures explicit and actionable after SSR removal.

**Independent Test**: Trigger startup prerequisite failure and verify output includes clear cause and concrete remediation step.

### Tests for User Story 3

- [X] T020 [P] [US3] Add integration coverage for actionable startup failure responses in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T021 [P] [US3] Add unit tests for startup diagnostic contract formatting in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 3

- [X] T022 [US3] Apply standardized actionable failure output in startup error path in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T023 [US3] Align failure messaging contract with runtime behavior in /Users/nick/code/template-hono-spa/specs/002-remove-ssr/contracts/client-rendering-contract.md
- [X] T024 [US3] Update troubleshooting guidance for startup failures in /Users/nick/code/template-hono-spa/README.md

**Checkpoint**: US3 independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, artifact alignment, and regression verification.

- [X] T025 [P] Reconcile plan/spec/research language consistency in /Users/nick/code/template-hono-spa/specs/002-remove-ssr/plan.md
- [X] T026 [P] Refresh data model and contract alignment notes in /Users/nick/code/template-hono-spa/specs/002-remove-ssr/data-model.md
- [X] T027 Run full regression validation and record outcomes in /Users/nick/code/template-hono-spa/specs/002-remove-ssr/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 and delivers MVP.
- **Phase 4 (US2)**: Depends on Phase 2 and should follow US1 baseline route behavior.
- **Phase 5 (US3)**: Depends on Phase 2 and should follow US2 startup-path stabilization.
- **Phase 6 (Polish)**: Depends on all completed story phases.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational completion.
- **US2 (P2)**: Independent after Foundational, but benefits from US1 shell path completion.
- **US3 (P3)**: Independent after Foundational, but benefits from US2 startup behavior stabilization.

### Dependency Graph

- Setup -> Foundational -> US1 -> US2 -> US3 -> Polish

---

## Parallel Execution Examples

### User Story 1

```bash
Task T008: Add integration assertions for shell-only page responses in /Users/nick/code/template-hono-spa/test/integration.spec.ts
Task T009: Add unit assertions that route handlers exclude server-rendered app body content in /Users/nick/code/template-hono-spa/test/unit.spec.ts
```

### User Story 2

```bash
Task T014: Add integration scenario for clean-workspace startup reliability in /Users/nick/code/template-hono-spa/test/integration.spec.ts
Task T015: Add unit coverage for missing-artifact startup fallback paths in /Users/nick/code/template-hono-spa/test/unit.spec.ts
```

### User Story 3

```bash
Task T020: Add integration coverage for actionable startup failure responses in /Users/nick/code/template-hono-spa/test/integration.spec.ts
Task T021: Add unit tests for startup diagnostic contract formatting in /Users/nick/code/template-hono-spa/test/unit.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently using shell-only route checks.
4. Demo/release MVP.

### Incremental Delivery

1. Deliver US1 for client-only rendering baseline.
2. Deliver US2 for startup reliability in clean workspace.
3. Deliver US3 for actionable startup diagnostics.
4. Execute polish and regression verification.

### Parallel Team Strategy

1. One developer handles foundational runtime helpers.
2. One developer handles test tasks marked `[P]`.
3. After US1 merge, split US2/US3 with coordination on `src/server/index.tsx`.

---

## Notes

- All tasks follow required checklist format and include absolute file paths.
- Story labels are used only for user story phases.
- Each story phase includes independent test criteria.
