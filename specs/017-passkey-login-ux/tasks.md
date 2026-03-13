# Tasks: Passkey Login UX

**Input**: Design documents from `/specs/017-passkey-login-ux/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test-first tasks because the plan explicitly requires expanded unit and integration coverage for login-method switching, visibility, and password fallback.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current login-route seams and UX contract before implementation

- [X] T001 Review the login-method UI contract in /Users/nick/code/template-hono-spa/specs/017-passkey-login-ux/contracts/login-method-ui-contract.md alongside the current route implementation in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T002 [P] Review existing login-route coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts to identify the exact assertions to extend for passkey-first UX

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared login-method state and route structure that all stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add route-local sign-in method state types and UI-only passkey attempt state in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T004 Create the base login-route layout and copy structure in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so one method can be active while the alternate path remains visible
- [X] T005 Add foundational styling hooks for active-method emphasis and method-specific layout states in /Users/nick/code/template-hono-spa/src/client/routes/login.css

**Checkpoint**: Login route foundation is ready for independently testable user-story work

---

## Phase 3: User Story 1 - Sign in quickly with a passkey (Priority: P1) 🎯 MVP

**Goal**: Give passkey-capable users a direct, obvious path from the login screen without requiring password entry

**Independent Test**: Open `/login` and confirm a direct passkey sign-in action is visible on first view, can be activated without filling in the password field, and changes the screen into a passkey-focused state

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Add unit coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for passkey-first login UI entry, passkey-focused copy, and the absence of password requirement in passkey mode
- [X] T007 [P] [US1] Add route integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts for `/login` shell behavior while the passkey-first UI is present

### Implementation for User Story 1

- [X] T008 [US1] Implement the direct passkey entry action and passkey-active route state in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T009 [US1] Update passkey-mode presentation and emphasis styles in /Users/nick/code/template-hono-spa/src/client/routes/login.css so the passkey path is the obvious next action on first view

**Checkpoint**: User Story 1 should now be independently functional and demoable as the MVP

---

## Phase 4: User Story 2 - Fall back to password sign-in (Priority: P2)

**Goal**: Preserve the familiar identifier-plus-password path as a clear fallback for users who do not want passkeys

**Independent Test**: Open `/login`, switch to the password path, and confirm identifier and password fields become the active method controls while passkey remains available as an alternative

### Tests for User Story 2 ⚠️

- [X] T010 [P] [US2] Extend password-path behavioral coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for method switching, password validation, and preserved password fallback visibility

### Implementation for User Story 2

- [X] T011 [US2] Update password-mode switching, validation gating, and fallback behavior in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T012 [US2] Refine password-active and fallback styles in /Users/nick/code/template-hono-spa/src/client/routes/login.css so the password path remains understandable without obscuring passkey

**Checkpoint**: User Stories 1 and 2 should now both work independently on the same route

---

## Phase 5: User Story 3 - Understand which sign-in method is active (Priority: P3)

**Goal**: Make the active login method obvious and reversible so users are not confused by the new choice

**Independent Test**: Open `/login`, switch between passkey and password methods, and confirm the active method is visually distinct, the relevant controls update, and the inactive path remains available without mixed-state confusion

### Tests for User Story 3 ⚠️

- [X] T013 [P] [US3] Add active-method visibility and mixed-state regression coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 3

- [X] T014 [US3] Update login method labels, supporting copy, and primary-action text in /Users/nick/code/template-hono-spa/src/client/routes/login.ts to reflect the currently active method from multiple cues
- [X] T015 [US3] Finalize active-method emphasis and mixed-state prevention styles in /Users/nick/code/template-hono-spa/src/client/routes/login.css

**Checkpoint**: All user stories should now be independently functional and comprehensible

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation across the full feature

- [X] T016 [P] Update the validation notes and method-behavior expectations in /Users/nick/code/template-hono-spa/specs/017-passkey-login-ux/quickstart.md and /Users/nick/code/template-hono-spa/specs/017-passkey-login-ux/contracts/login-method-ui-contract.md
- [X] T017 Run lint and full test validation for the feature from /Users/nick/code/template-hono-spa/package.json using the commands documented in /Users/nick/code/template-hono-spa/specs/017-passkey-login-ux/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow the passkey-first structure from User Story 1
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 because active-method clarity depends on both method paths existing
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **US1**: No dependency on other stories after Phase 2
- **US2**: Depends on US1’s shared login-method structure so the password path can act as fallback
- **US3**: Depends on US1 and US2 because active-method clarity is only meaningful once both paths exist

### Within Each User Story

- Tests must be written and fail before implementation
- Route state changes before style refinements
- Core behavior before copy and polish
- Story validation before moving to the next dependent story

### Parallel Opportunities

- `T001` and `T002` can run in parallel
- `T006` and `T007` can run in parallel because they target different test files
- `T016` can run in parallel with the final verification prep before `T017`

---

## Parallel Example: User Story 1

```bash
Task: "Add unit coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for passkey-first login UI entry, passkey-focused copy, and the absence of password requirement in passkey mode"
Task: "Add route integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts for /login shell behavior while the passkey-first UI is present"
```

---

## Parallel Example: User Story 2

```bash
Task: "Review the password fallback assertions needed in /Users/nick/code/template-hono-spa/test/unit.spec.ts while preparing the password-mode behavior update in /Users/nick/code/template-hono-spa/src/client/routes/login.ts"
Task: "Prepare password-active fallback styling updates in /Users/nick/code/template-hono-spa/src/client/routes/login.css after the method-switch behavior is defined"
```

---

## Parallel Example: User Story 3

```bash
Task: "Add active-method visibility and mixed-state regression coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Update the validation notes and method-behavior expectations in /Users/nick/code/template-hono-spa/specs/017-passkey-login-ux/quickstart.md and /Users/nick/code/template-hono-spa/specs/017-passkey-login-ux/contracts/login-method-ui-contract.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate the passkey-first login entry on `/login`

### Incremental Delivery

1. Finish Setup and Foundational work to establish login-method state
2. Deliver User Story 1 for direct passkey-first sign-in
3. Deliver User Story 2 for password fallback
4. Deliver User Story 3 for active-method clarity
5. Finish with documentation updates and full verification

### Parallel Team Strategy

1. One developer establishes shared login-method state and base route structure
2. During US1, one developer can extend unit coverage while another extends route integration coverage
3. During final polish, one developer can update docs while another prepares the full verification run

---

## Notes

- Every task uses the required checklist format with sequential IDs and exact file paths
- All user-story tasks include the required `[US1]`, `[US2]`, or `[US3]` labels
- Tests are included because the implementation plan explicitly calls for expanded coverage
- The MVP scope is User Story 1 after Setup and Foundational phases
