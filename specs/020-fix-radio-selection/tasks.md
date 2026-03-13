# Tasks: Fix Radio Selection

**Input**: Design documents from `/specs/020-fix-radio-selection/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test-first tasks because the plan explicitly calls for regression coverage around first-click selection updates, shared radio styling usage, and selected-state synchronization with visible login content.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the current selector bug surface and the intended single-click radio behavior before code changes

- [X] T001 Review the login radio-selection contract in /Users/nick/code/template-hono-spa/specs/020-fix-radio-selection/contracts/login-radio-selection-contract.md alongside the current selector implementation in /Users/nick/code/template-hono-spa/src/client/routes/login.ts and /Users/nick/code/template-hono-spa/src/client/routes/login.css
- [X] T002 [P] Review the existing login-selector assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts to identify where first-click selection and content sync coverage must be added

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stabilize the shared selector wiring and selection flow that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Confirm the shared radio-input stylesheet and registration path remain intact in /Users/nick/code/template-hono-spa/src/style.css and /Users/nick/code/template-hono-spa/src/client/index.ts
- [X] T004 Add or refine route-local selection wiring in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so radio-input interactions can update the selected method on the first click
- [X] T005 Add or refine selector-state styling hooks in /Users/nick/code/template-hono-spa/src/client/routes/login.css so the visible selected state can remain synchronized with the current method

**Checkpoint**: The login route has stable shared selector wiring and state hooks for story-specific behavior work

---

## Phase 3: User Story 1 - Select a sign-in method on the first click (Priority: P1) 🎯 MVP

**Goal**: Make passkey and password visibly select on the first click

**Independent Test**: Open `/login`, click passkey or password once, and confirm the selected option updates immediately on that same interaction

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Extend selector interaction assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for first-click selection updates and synchronized selected-state feedback
- [X] T007 [P] [US1] Extend login shell coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts to keep `/login` stable while the corrected radio selection behavior is in place

### Implementation for User Story 1

- [X] T008 [US1] Refine radio-input change handling and selected-state mapping in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so the chosen option becomes visibly selected after one click
- [X] T009 [US1] Refine selected-state presentation hooks in /Users/nick/code/template-hono-spa/src/client/routes/login.css so the visible indicator stays aligned with the active method after one click

**Checkpoint**: User Story 1 should now be independently functional and demonstrate the single-click fix

---

## Phase 4: User Story 2 - See the shared radio control styling consistently (Priority: P2)

**Goal**: Keep the shared radio-input control and stylesheet visibly active while the selector bug is fixed

**Independent Test**: Open `/login` and confirm the selector uses the shared radio styling while the selected state still updates immediately after one click

### Tests for User Story 2 ⚠️

- [X] T010 [P] [US2] Extend selector styling assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for continued shared radio-input usage and selected-state synchronization

### Implementation for User Story 2

- [X] T011 [US2] Refine selector markup and shared-control wiring in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so the route continues to use the shared radio-input control cleanly
- [X] T012 [US2] Refine shared-selector styling integration in /Users/nick/code/template-hono-spa/src/client/routes/login.css and /Users/nick/code/template-hono-spa/src/style.css so the intended radio-input styling remains active

**Checkpoint**: User Stories 1 and 2 should both work independently on the same route

---

## Phase 5: User Story 3 - Keep passkey and password content in sync with the selected option (Priority: P3)

**Goal**: Ensure the visible login content always matches the currently selected method after one click

**Independent Test**: Open `/login`, switch between passkey and password, and confirm the visible selected option, displayed guidance, and active login controls remain synchronized

### Tests for User Story 3 ⚠️

- [X] T013 [P] [US3] Extend synchronization assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for selected option, active guidance, validation feedback, and visible login controls remaining aligned

### Implementation for User Story 3

- [X] T014 [US3] Refine method-content synchronization in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so passkey and password content always match the selected option immediately
- [X] T015 [US3] Refine selector-and-content spacing or feedback styling in /Users/nick/code/template-hono-spa/src/client/routes/login.css so validation and status messages do not visually confuse the selected method

**Checkpoint**: All user stories should now be independently functional and synchronized

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and verification across the full feature

- [X] T016 [P] Update the validation notes and single-click selection expectations in /Users/nick/code/template-hono-spa/specs/020-fix-radio-selection/quickstart.md and /Users/nick/code/template-hono-spa/specs/020-fix-radio-selection/contracts/login-radio-selection-contract.md
- [X] T017 Run lint and full test validation for the feature from /Users/nick/code/template-hono-spa/package.json using the commands documented in /Users/nick/code/template-hono-spa/specs/020-fix-radio-selection/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow the corrected selector wiring from User Story 1
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 because method-content synchronization depends on both the corrected selection flow and the retained shared selector styling
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **US1**: No dependency on other stories after Phase 2
- **US2**: Depends on US1’s corrected first-click selection behavior so the shared styling can be validated on top of the stable interaction
- **US3**: Depends on US1 and US2 because content synchronization depends on both correct selection flow and stable shared selector presentation

### Within Each User Story

- Tests must be written and fail before implementation
- Selection wiring before final styling refinements
- Visible selected-state behavior before content-sync polish
- Story validation before moving to the next dependent story

### Parallel Opportunities

- `T001` and `T002` can run in parallel
- `T006` and `T007` can run in parallel because they target different test files
- `T016` can run in parallel with final verification preparation before `T017`

---

## Parallel Example: User Story 1

```bash
Task: "Extend selector interaction assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for first-click selection updates and synchronized selected-state feedback"
Task: "Extend login shell coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts to keep /login stable while the corrected radio selection behavior is in place"
```

---

## Parallel Example: User Story 2

```bash
Task: "Review and extend selector styling assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for continued shared radio-input usage and selected-state synchronization"
Task: "Prepare shared-selector styling integration updates in /Users/nick/code/template-hono-spa/src/client/routes/login.css and /Users/nick/code/template-hono-spa/src/style.css after the corrected selection flow is stable"
```

---

## Parallel Example: User Story 3

```bash
Task: "Extend synchronization assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for selected option, active guidance, validation feedback, and visible login controls remaining aligned"
Task: "Update the validation notes and single-click selection expectations in /Users/nick/code/template-hono-spa/specs/020-fix-radio-selection/quickstart.md and /Users/nick/code/template-hono-spa/specs/020-fix-radio-selection/contracts/login-radio-selection-contract.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate single-click method selection on `/login`

### Incremental Delivery

1. Finish Setup and Foundational work to stabilize selector wiring
2. Deliver User Story 1 for first-click visible selection
3. Deliver User Story 2 for continued shared radio-input styling
4. Deliver User Story 3 for synchronized method-specific content
5. Finish with documentation updates and full verification

### Parallel Team Strategy

1. One developer stabilizes the shared selector wiring and state flow
2. During US1, one developer can extend unit coverage while another extends route integration coverage
3. During final polish, one developer can update docs while another prepares the full verification run

---

## Notes

- Every task uses the required checklist format with sequential IDs and exact file paths
- All user-story tasks include the required `[US1]`, `[US2]`, or `[US3]` labels
- Tests are included because the implementation plan explicitly calls for regression coverage around selector behavior
- The MVP scope is User Story 1 after Setup and Foundational phases
