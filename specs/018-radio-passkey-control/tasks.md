# Tasks: Radio Passkey Control

**Input**: Design documents from `/specs/018-radio-passkey-control/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test-first tasks because the plan explicitly requires expanded unit and integration coverage for radio selection, active state, and password fallback behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the current login-route seams and requested radio-selector contract before implementation

- [X] T001 Review the login radio-selector contract in /Users/nick/code/template-hono-spa/specs/018-radio-passkey-control/contracts/login-radio-selector-contract.md alongside the current route implementation in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T002 [P] Review existing login-route coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts to identify the exact assertions to replace for the radio-selector UX

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared radio-driven login-method state and route structure that all stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add or adapt route-local sign-in method selection state in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so it can drive a single radio-button control group
- [X] T004 Add the base radio-selector layout and method-specific content structure in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so one selected option controls the visible login path
- [X] T005 Add foundational styling hooks for the radio selector and selected-method presentation in /Users/nick/code/template-hono-spa/src/client/routes/login.css

**Checkpoint**: Login route foundation is ready for independently testable user-story work

---

## Phase 3: User Story 1 - Choose a sign-in method clearly (Priority: P1) 🎯 MVP

**Goal**: Show passkey and password as a clear radio-button choice on the login screen

**Independent Test**: Open `/login` and confirm both methods appear together in one radio-button selector, with one option selected at a time and the active selection clearly indicated

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Add unit coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for the radio-button selector, mutual exclusivity, and active selection state
- [X] T007 [P] [US1] Add route integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts for `/login` shell behavior while the radio-selector UI is present

### Implementation for User Story 1

- [X] T008 [US1] Implement the radio-button method selector in /Users/nick/code/template-hono-spa/src/client/routes/login.ts using the selected method state as the source of truth
- [X] T009 [US1] Update selector layout and selected-state presentation in /Users/nick/code/template-hono-spa/src/client/routes/login.css to match the requested radio-button interaction pattern

**Checkpoint**: User Story 1 should now be independently functional and demoable as the MVP

---

## Phase 4: User Story 2 - Continue with passkey from the selected radio option (Priority: P2)

**Goal**: Preserve passkey as a password-free path after the radio selector is introduced

**Independent Test**: Open `/login`, select the passkey radio option, and confirm the passkey path becomes active without making password fields appear required

### Tests for User Story 2 ⚠️

- [X] T010 [P] [US2] Extend passkey-path coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for passkey selection, passkey-specific copy, and password-free continuation

### Implementation for User Story 2

- [X] T011 [US2] Adapt passkey selection and passkey-attempt behavior in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so the passkey radio option drives the current passkey flow
- [X] T012 [US2] Refine passkey-selected presentation in /Users/nick/code/template-hono-spa/src/client/routes/login.css so the passkey path is clearly active when that option is selected

**Checkpoint**: User Stories 1 and 2 should now both work independently on the same route

---

## Phase 5: User Story 3 - Fall back to password sign-in from the same selector (Priority: P3)

**Goal**: Keep the familiar identifier-and-password flow available through the same radio-button control

**Independent Test**: Open `/login`, select the password radio option, and confirm the identifier and password fields become the active controls while passkey remains available in the same selector

### Tests for User Story 3 ⚠️

- [X] T013 [P] [US3] Extend password fallback coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for password selection, required-field behavior, and fallback availability after passkey issues

### Implementation for User Story 3

- [X] T014 [US3] Adapt password-selected validation and fallback behavior in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so the password option drives the existing identifier-and-password flow
- [X] T015 [US3] Finalize password-selected and fallback styling in /Users/nick/code/template-hono-spa/src/client/routes/login.css so the active password state is clear without hiding passkey

**Checkpoint**: All user stories should now be independently functional and comprehensible

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation across the full feature

- [X] T016 [P] Update the validation notes and selector-behavior expectations in /Users/nick/code/template-hono-spa/specs/018-radio-passkey-control/quickstart.md and /Users/nick/code/template-hono-spa/specs/018-radio-passkey-control/contracts/login-radio-selector-contract.md
- [X] T017 Run lint and full test validation for the feature from /Users/nick/code/template-hono-spa/package.json using the commands documented in /Users/nick/code/template-hono-spa/specs/018-radio-passkey-control/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow the radio-selector structure from User Story 1
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 because the final fallback experience depends on both method paths existing in the same selector
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **US1**: No dependency on other stories after Phase 2
- **US2**: Depends on US1’s shared selector structure so passkey can be activated through the radio group
- **US3**: Depends on US1 and US2 because password fallback is only meaningful once both radio options are wired

### Within Each User Story

- Tests must be written and fail before implementation
- Selector state changes before style refinements
- Core behavior before copy and polish
- Story validation before moving to the next dependent story

### Parallel Opportunities

- `T001` and `T002` can run in parallel
- `T006` and `T007` can run in parallel because they target different test files
- `T016` can run in parallel with final verification prep before `T017`

---

## Parallel Example: User Story 1

```bash
Task: "Add unit coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for the radio-button selector, mutual exclusivity, and active selection state"
Task: "Add route integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts for /login shell behavior while the radio-selector UI is present"
```

---

## Parallel Example: User Story 2

```bash
Task: "Review the passkey-selection assertions needed in /Users/nick/code/template-hono-spa/test/unit.spec.ts while preparing the passkey radio-path update in /Users/nick/code/template-hono-spa/src/client/routes/login.ts"
Task: "Prepare passkey-selected styling updates in /Users/nick/code/template-hono-spa/src/client/routes/login.css after the radio-selector structure is defined"
```

---

## Parallel Example: User Story 3

```bash
Task: "Extend password fallback coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for password selection, required-field behavior, and fallback availability after passkey issues"
Task: "Update the validation notes and selector-behavior expectations in /Users/nick/code/template-hono-spa/specs/018-radio-passkey-control/quickstart.md and /Users/nick/code/template-hono-spa/specs/018-radio-passkey-control/contracts/login-radio-selector-contract.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate the radio-button selector on `/login`

### Incremental Delivery

1. Finish Setup and Foundational work to establish selector-driven login-method state
2. Deliver User Story 1 for the radio-button method selector
3. Deliver User Story 2 for passkey selection
4. Deliver User Story 3 for password fallback
5. Finish with documentation updates and full verification

### Parallel Team Strategy

1. One developer establishes the shared radio-selector state and base route structure
2. During US1, one developer can extend unit coverage while another extends route integration coverage
3. During final polish, one developer can update docs while another prepares the full verification run

---

## Notes

- Every task uses the required checklist format with sequential IDs and exact file paths
- All user-story tasks include the required `[US1]`, `[US2]`, or `[US3]` labels
- Tests are included because the implementation plan explicitly calls for expanded coverage
- The MVP scope is User Story 1 after Setup and Foundational phases
