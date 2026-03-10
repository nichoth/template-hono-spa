# Tasks: Mobile Home Layout Usability

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/`
**Prerequisites**: `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/plan.md`, `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/spec.md`, `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/research.md`, `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/data-model.md`, `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/contracts/mobile-layout-contract.md`

**Tests**: The feature spec does not explicitly require new automated tests; this task list relies on existing test/lint commands plus manual mobile validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable task (different file, no unmet dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`) for story-phase tasks only
- Every task includes an exact file path or command target with path context

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm scope and establish mobile-validation baseline artifacts.

- [X] T001 Validate feature scope and acceptance criteria in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/spec.md`
- [X] T002 Validate technical constraints and structure in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/plan.md`
- [X] T003 Record baseline mobile observations and viewport targets in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared mobile-first layout constraints used by all stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase completes.

- [X] T004 Add shared mobile layout tokens and spacing rules in `/Users/nick/code/template-hono-spa/src/style.css`
- [X] T005 [P] Ensure navigation/header container can wrap safely on narrow widths in `/Users/nick/code/template-hono-spa/src/client/components/nav.css`
- [X] T006 [P] Ensure home route root exposes stable mobile layout hooks in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- [X] T007 Document finalized foundational mobile decisions in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/research.md`

**Checkpoint**: Shared mobile foundation is complete.

---

## Phase 3: User Story 1 - Read Core Content on Mobile (Priority: P1) 🎯 MVP

**Goal**: Make core home content readable on mobile with no horizontal scrolling.

**Independent Test**: At small-phone viewports (e.g., 320px/360px/390px), confirm home content fits viewport width and remains readable without zoom.

### Implementation for User Story 1

- [X] T008 [US1] Implement mobile-first home content flow and width constraints in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`
- [X] T009 [P] [US1] Apply card-level mobile readability and overflow safeguards in `/Users/nick/code/template-hono-spa/src/client/components/card.css`
- [X] T010 [P] [US1] Tune global content container widths to prevent mobile horizontal overflow in `/Users/nick/code/template-hono-spa/src/style.css`
- [X] T011 [US1] Align home route structure/classes with mobile readability contract in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- [X] T012 [US1] Update US1 mobile viewport verification procedure in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/quickstart.md`

**Checkpoint**: User Story 1 works independently.

---

## Phase 4: User Story 2 - Maintain Stable Mobile Layout While Interacting (Priority: P2)

**Goal**: Keep layout stable while users tap controls and navigate on mobile.

**Independent Test**: At mobile viewports, perform repeated counter taps and route navigation taps; confirm no overlap, clipping, spacing collapse, or tap interference.

### Implementation for User Story 2

- [X] T013 [US2] Add mobile interaction-state spacing stability rules in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`
- [X] T014 [P] [US2] Ensure counter/control row wrapping remains tappable under narrow widths in `/Users/nick/code/template-hono-spa/src/client/components/card.css`
- [X] T015 [P] [US2] Ensure mobile nav/header spacing remains stable during route changes in `/Users/nick/code/template-hono-spa/src/client/components/nav.css`
- [X] T016 [US2] Confirm route-level layout class usage supports interaction stability in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- [X] T017 [US2] Update repeated-interaction validation criteria in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/quickstart.md`

**Checkpoint**: User Stories 1 and 2 are both independently testable and stable together.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, contract alignment, and delivery notes.

- [X] T018 Run regression tests from `/Users/nick/code/template-hono-spa/package.json` via `cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test`
- [X] T019 Run lint checks from `/Users/nick/code/template-hono-spa/package.json` via `cd /Users/nick/code/template-hono-spa && npm run lint`
- [ ] T020 Perform manual mobile validation checklist in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/quickstart.md`
- [X] T021 [P] Reconcile final user-visible behavior wording in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/contracts/mobile-layout-contract.md`
- [X] T022 [P] Record implementation outcomes and verification notes in `/Users/nick/code/template-hono-spa/specs/008-fix-mobile-view/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks user story phases.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 and builds on US1 mobile readability baseline.
- **Phase 5 (Polish)**: Depends on completion of intended user stories.

### User Story Dependencies

- **US1 (P1)**: Independent first deliverable after foundational work.
- **US2 (P2)**: Depends on the stable mobile readability baseline created in US1.

### Dependency Graph

- `US1 -> US2`
- `Setup -> Foundational -> US1 -> US2 -> Polish`

### Within Each User Story

- Implement primary layout rules first.
- Apply component-level safeguards second.
- Update story-specific validation steps last.

### Parallel Opportunities

- **Foundational**: T005 and T006 parallel after T004.
- **US1**: T009 and T010 parallel after T008.
- **US2**: T014 and T015 parallel after T013.
- **Polish**: T021 and T022 parallel after T020.

---

## Parallel Example: User Story 1

```bash
Task: "T009 [US1] Apply card-level mobile safeguards in /Users/nick/code/template-hono-spa/src/client/components/card.css"
Task: "T010 [US1] Tune global content width rules in /Users/nick/code/template-hono-spa/src/style.css"
```

## Parallel Example: User Story 2

```bash
Task: "T014 [US2] Ensure control-row wrapping remains tappable in /Users/nick/code/template-hono-spa/src/client/components/card.css"
Task: "T015 [US2] Stabilize mobile nav/header spacing in /Users/nick/code/template-hono-spa/src/client/components/nav.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently at mobile viewport targets.
4. Demo/deploy MVP if accepted.

### Incremental Delivery

1. Deliver US1 mobile readability and overflow control.
2. Deliver US2 interaction stability and route consistency.
3. Complete polish and verification notes.

### Parallel Team Strategy

1. Team completes Setup and Foundational phases.
2. During US1/US2, split component and route/style tasks using `[P]` markers.
3. Rejoin for final verification and documentation alignment.

---

## Notes

- Task format strictly follows checkbox + ID + optional `[P]` + optional `[US#]` + path-specific description.
- User story phases remain independently verifiable via explicit independent tests.
- Avoid scope expansion beyond mobile readability and interaction stability goals.
- T018/T019 now pass after fixing test-path drift and removing DOM-dependent test-runtime usage in counter controls.
- T020 remains pending manual viewport validation (requires interactive browser confirmation).
