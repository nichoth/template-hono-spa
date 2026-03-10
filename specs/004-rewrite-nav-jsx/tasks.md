# Tasks: Rewrite Navigation Component to JSX

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include verification tasks using existing lint/test commands; no new TDD-first test authoring is required by the spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm scope, baseline behavior checks, and implementation targets.

- [X] T001 Confirm acceptance scope and story priorities in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/spec.md
- [X] T002 Confirm migration decisions and constraints in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/research.md
- [X] T003 Capture manual validation flow for this feature in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared prerequisites before user-story implementation.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [X] T004 Align route metadata source and exported nav fields in /Users/nick/code/template-hono-spa/src/client/routes/index.ts
- [X] T005 Define typed navigation component contract expectations in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/contracts/nav-component-contract.md
- [X] T006 Identify integration points for the shared nav component in /Users/nick/code/template-hono-spa/src/app.tsx
- [X] T007 Identify bootstrap-level dependencies for route state usage in /Users/nick/code/template-hono-spa/src/client/index.tsx

**Checkpoint**: Foundational prerequisites are complete.

---

## Phase 3: User Story 1 - Navigate Reliably Across Pages (Priority: P1) 🎯 MVP

**Goal**: Users can navigate through header links and always reach expected content with correct active-state indication.

**Independent Test**: Start app, click each rendered nav link, confirm destination content and active marker are correct for each known route.

### Implementation for User Story 1

- [X] T008 [US1] Rewrite navigation rendering from template literals to JSX in /Users/nick/code/template-hono-spa/src/components/nav.tsx
- [X] T009 [US1] Correct navigation state typing/import path usage in /Users/nick/code/template-hono-spa/src/components/nav.tsx
- [X] T010 [US1] Implement route-normalized active-state class assignment in /Users/nick/code/template-hono-spa/src/components/nav.tsx
- [X] T011 [US1] Integrate rewritten Nav component into app header rendering in /Users/nick/code/template-hono-spa/src/app.tsx
- [X] T012 [P] [US1] Validate known-route link destinations remain intact in /Users/nick/code/template-hono-spa/src/client/routes/index.ts
- [X] T013 [P] [US1] Verify route updates from app bootstrap remain compatible with Nav behavior in /Users/nick/code/template-hono-spa/src/client/index.tsx

**Checkpoint**: User Story 1 is functional and independently testable.

---

## Phase 4: User Story 2 - Maintain Navigation Safely (Priority: P2)

**Goal**: Developers can safely edit nav labels/paths using repo-consistent component syntax without regressions.

**Independent Test**: Change one nav label/path, run lint/tests, and confirm the component still compiles and navigation behavior remains correct.

### Implementation for User Story 2

- [X] T014 [US2] Refine nav item typing and update ergonomics for future edits in /Users/nick/code/template-hono-spa/src/components/nav.tsx
- [X] T015 [US2] Consolidate nav item configuration to minimize duplicate route metadata in /Users/nick/code/template-hono-spa/src/components/nav.tsx
- [X] T016 [P] [US2] Update contract guarantees to match finalized maintainability behavior in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/contracts/nav-component-contract.md
- [X] T017 [P] [US2] Document label/path update verification steps in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/quickstart.md

**Checkpoint**: User Story 2 is functional and independently testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and planning-doc consistency.

- [X] T018 [P] Run lint and test verification commands and capture outcomes in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/quickstart.md
- [X] T019 [P] Reconcile implementation summary with delivered behavior in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/plan.md
- [X] T020 [P] Confirm entity/contract alignment after implementation in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/data-model.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 and can follow US1 delivery for lower risk.
- **Phase 5 (Polish)**: Depends on completed story phases.

### User Story Dependencies

- **US1 (P1)**: Independent after foundational completion.
- **US2 (P2)**: Independent after foundational completion; benefits from US1 Nav rewrite completion for consistency.

### Dependency Graph

- Setup -> Foundational -> US1 -> US2 -> Polish

---

## Parallel Execution Examples

### User Story 1

```bash
Task T012: Validate known-route link destinations remain intact in /Users/nick/code/template-hono-spa/src/client/routes/index.ts
Task T013: Verify route updates from app bootstrap remain compatible with Nav behavior in /Users/nick/code/template-hono-spa/src/client/index.tsx
```

### User Story 2

```bash
Task T016: Update contract guarantees to match finalized maintainability behavior in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/contracts/nav-component-contract.md
Task T017: Document label/path update verification steps in /Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/quickstart.md
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently using the story's independent test criteria.
4. Demo or ship MVP.

### Incremental Delivery

1. Deliver US1 navigation correctness and active-state behavior.
2. Deliver US2 maintainability improvements and edit workflow documentation.
3. Execute polish tasks for validation evidence and documentation alignment.

### Parallel Team Strategy

1. One engineer implements `src/components/nav.tsx` migration tasks.
2. One engineer executes route/bootstrap compatibility tasks in `src/client/routes/index.ts` and `src/client/index.tsx`.
3. One engineer updates contract/quickstart docs once behavior stabilizes.

---

## Notes

- All tasks follow the required checklist format with task IDs and file paths.
- Story labels are used only for user-story phases.
- Tasks are scoped so each story can be validated independently.
