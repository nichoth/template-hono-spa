# Tasks: Responsive Home Grid Columns

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/`
**Prerequisites**: `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/plan.md`, `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/spec.md`, `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/research.md`, `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/data-model.md`, `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/contracts/ui-layout-contract.md`

**Tests**: Automated test creation is not explicitly requested in the feature spec; this task list uses existing test/lint/manual validation commands.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm working baseline and feature scope before code changes.

- [X] T001 Validate feature scope and acceptance criteria in `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/spec.md`
- [X] T002 Verify implementation constraints and target files in `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/plan.md`
- [X] T003 Capture current home layout baseline notes in `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared layout structure required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add/standardize home grid container class wiring in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- [X] T005 [P] Define shared layout spacing and width tokens in `/Users/nick/code/template-hono-spa/src/style.css`
- [X] T006 [P] Ensure card container supports grid participation without clipping in `/Users/nick/code/template-hono-spa/src/client/components/card.css`
- [X] T007 Document foundational layout decisions in `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/research.md`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - See Balanced Content Layout (Priority: P1) 🎯 MVP

**Goal**: Render a balanced multi-column home layout with at least 2 columns at the reference viewport.

**Independent Test**: Open the app at screenshot-equivalent width and verify the primary content area renders at least 2 columns with consistent spacing and alignment.

### Implementation for User Story 1

- [X] T008 [US1] Implement the base 2-column home grid rules for reference desktop widths in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`
- [X] T009 [P] [US1] Adjust home route markup wrappers to match the grid container contract in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- [X] T010 [P] [US1] Refine card-level layout constraints for two-column readability in `/Users/nick/code/template-hono-spa/src/client/components/card.css`
- [X] T011 [US1] Align home grid block positioning with surrounding page chrome in `/Users/nick/code/template-hono-spa/src/style.css`
- [X] T012 [US1] Update user-facing verification steps for the reference-width check in `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/quickstart.md`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Keep Content Readable While Resizing (Priority: P2)

**Goal**: Add stable responsive transitions so 3 columns appear at wider widths and resizing does not cause overlap/clipping/overflow.

**Independent Test**: Resize from narrow to wide and back repeatedly; verify clean transitions, no overlap/clipping/horizontal scrolling, and 3 columns at wider desktop widths.

### Implementation for User Story 2

- [X] T013 [US2] Add wide-viewport 3-column breakpoint behavior in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`
- [X] T014 [P] [US2] Tune grid thresholds and spacing behavior during transitions in `/Users/nick/code/template-hono-spa/src/style.css`
- [X] T015 [P] [US2] Ensure card content wraps safely across breakpoint transitions in `/Users/nick/code/template-hono-spa/src/client/components/card.css`
- [X] T016 [US2] Update home route structure/classes if required for transition stability in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- [X] T017 [US2] Update resize-validation instructions and pass criteria in `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/quickstart.md`

**Checkpoint**: User Stories 1 and 2 both work independently and together.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation alignment across stories.

- [X] T018 Run regression tests defined in `/Users/nick/code/template-hono-spa/package.json` via `cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test`
- [X] T019 Run lint checks defined in `/Users/nick/code/template-hono-spa/package.json` via `cd /Users/nick/code/template-hono-spa && npm run lint`
- [ ] T020 Perform manual viewport validation from `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/quickstart.md`
- [X] T021 [P] Reconcile contract/spec wording with final behavior in `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/contracts/ui-layout-contract.md`
- [X] T022 [P] Record final implementation notes and results in `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2 completion and builds on US1 layout baseline.
- **Phase 5 (Polish)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories; first MVP slice.
- **US2 (P2)**: Uses US1 grid baseline but remains independently testable once foundational work is done.

### Dependency Graph

- `US1 -> US2`
- `Setup -> Foundational -> US1 -> US2 -> Polish`

### Within Each User Story

- Apply core layout rules before route/class integration updates.
- Perform story-specific verification updates after implementation changes.
- Complete independent-test checks before moving to lower-priority stories.

### Parallel Opportunities

- **Foundational**: T005 and T006 can run in parallel after T004.
- **US1**: T009 and T010 can run in parallel after T008.
- **US2**: T014 and T015 can run in parallel after T013.
- **Polish**: T021 and T022 can run in parallel after T020.

---

## Parallel Example: User Story 1

```bash
Task: "T009 [US1] Adjust home route markup wrappers in /Users/nick/code/template-hono-spa/src/client/routes/home.ts"
Task: "T010 [US1] Refine card-level layout constraints in /Users/nick/code/template-hono-spa/src/client/components/card.css"
```

## Parallel Example: User Story 2

```bash
Task: "T014 [US2] Tune grid thresholds in /Users/nick/code/template-hono-spa/src/style.css"
Task: "T015 [US2] Ensure card wrapping in /Users/nick/code/template-hono-spa/src/client/components/card.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Run the US1 independent test at reference viewport width.
4. Demo/deploy US1 if accepted.

### Incremental Delivery

1. Deliver US1 (balanced 2-column baseline at target width).
2. Deliver US2 (3-column wide-screen behavior + resize stability).
3. Complete Polish phase for full verification and documentation sync.

### Parallel Team Strategy

1. Collaboratively finish Setup + Foundational.
2. One developer handles `home.css` breakpoint evolution while another validates card/style constraints in parallel tasks.
3. Rejoin for final polish validation commands and documentation sync.

---

## Notes

- All tasks follow the required checklist format: checkbox, task ID, optional `[P]`, optional `[US#]`, and file path/command target.
- User stories remain independently testable through their explicit independent-test criteria.
- Avoid cross-story scope creep beyond home-grid layout behavior.
- T018 command executed; current test suite has pre-existing failures outside this feature scope (see `/Users/nick/code/template-hono-spa/specs/007-fix-grid-columns/plan.md` implementation notes).
