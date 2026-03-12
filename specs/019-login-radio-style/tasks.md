# Tasks: Login Radio Style

**Input**: Design documents from `/specs/019-login-radio-style/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test-first tasks because the plan explicitly calls for focused unit and integration regression coverage around selector structure, active state, and retained passkey/password behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the current login selector implementation and the required shared-pattern references before making changes

- [X] T001 Review the login radio-style contract in /Users/nick/code/template-hono-spa/specs/019-login-radio-style/contracts/login-radio-style-contract.md alongside the current route implementation in /Users/nick/code/template-hono-spa/src/client/routes/login.ts and /Users/nick/code/template-hono-spa/src/client/routes/login.css
- [X] T002 [P] Review the existing selector-related coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts to identify assertions that should be tightened around the shared create-account pattern

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared selector structure and layout hooks that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Confirm the radio-input registration path remains intact in /Users/nick/code/template-hono-spa/src/client/index.ts for the login route
- [X] T004 Add or refine layout hooks in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so the selector can match the referenced shared pattern while remaining the single source of truth for method selection
- [X] T005 Add foundational selector-group styling hooks in /Users/nick/code/template-hono-spa/src/client/routes/login.css for shared-pattern spacing, grouping, and selected-state treatment

**Checkpoint**: The login route has stable structure and style hooks for story-specific refinement

---

## Phase 3: User Story 1 - See a familiar method selector on login (Priority: P1) 🎯 MVP

**Goal**: Make the login selector look and read like the shared create-account radio pattern

**Independent Test**: Open `/login` and confirm passkey and password appear in one radio selector with shared-pattern grouping, spacing, and clear selected state

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Extend selector structure and presentation assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for grouped radio-input options, shared-pattern copy, and active-state hooks
- [X] T007 [P] [US1] Extend login shell coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts for the refined radio-style login presentation remaining available on `/login`

### Implementation for User Story 1

- [X] T008 [US1] Refine the selector markup and surrounding copy in /Users/nick/code/template-hono-spa/src/client/routes/login.ts to align with the referenced create-account radio pattern while keeping both options visible together
- [X] T009 [US1] Update selector grouping, spacing, and selected-state styling in /Users/nick/code/template-hono-spa/src/client/routes/login.css to align the login selector with the shared radio-control family

**Checkpoint**: User Story 1 should now be independently functional and visually reviewable as the MVP

---

## Phase 4: User Story 2 - Continue with passkey from the selected option (Priority: P2)

**Goal**: Keep the passkey path active and understandable within the refined shared selector presentation

**Independent Test**: Open `/login`, keep or switch the selector to passkey, and confirm passkey guidance and action remain active without password requirements

### Tests for User Story 2 ⚠️

- [X] T010 [P] [US2] Extend passkey-path assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for passkey-selected guidance, visible selector persistence, and password-free continuation

### Implementation for User Story 2

- [X] T011 [US2] Refine passkey-selected content and selector persistence behavior in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so the passkey path stays clear within the shared-pattern layout
- [X] T012 [US2] Refine passkey-selected spacing and emphasis in /Users/nick/code/template-hono-spa/src/client/routes/login.css so the passkey path reads as the active method beneath the shared selector

**Checkpoint**: User Stories 1 and 2 should both work independently on the same route

---

## Phase 5: User Story 3 - Fall back to password without losing the shared pattern (Priority: P3)

**Goal**: Preserve the existing password path while keeping the selector visually consistent with the shared radio pattern

**Independent Test**: Open `/login`, switch the selector to password, and confirm the credential fields become active while the shared selector remains visible and clearly selected

### Tests for User Story 3 ⚠️

- [X] T013 [P] [US3] Extend password fallback assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for password-selected controls, visible selector persistence, and clear active-state behavior

### Implementation for User Story 3

- [X] T014 [US3] Refine password-selected content flow in /Users/nick/code/template-hono-spa/src/client/routes/login.ts so the existing credential path fits cleanly beneath the shared selector treatment
- [X] T015 [US3] Finalize password-selected layout, spacing, and fallback styling in /Users/nick/code/template-hono-spa/src/client/routes/login.css so password remains available without breaking the shared visual pattern

**Checkpoint**: All user stories should now be independently functional and visually coherent

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and verification across the full feature

- [X] T016 [P] Update the validation notes and shared-pattern expectations in /Users/nick/code/template-hono-spa/specs/019-login-radio-style/quickstart.md and /Users/nick/code/template-hono-spa/specs/019-login-radio-style/contracts/login-radio-style-contract.md
- [X] T017 Run lint and full test validation for the feature from /Users/nick/code/template-hono-spa/package.json using the commands documented in /Users/nick/code/template-hono-spa/specs/019-login-radio-style/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow the shared selector presentation established in User Story 1
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 because the password fallback must fit the same refined selector pattern
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **US1**: No dependency on other stories after Phase 2
- **US2**: Depends on US1’s shared selector presentation so passkey can remain clear within that pattern
- **US3**: Depends on US1 and US2 because the password fallback must preserve the same selector treatment alongside the passkey path

### Within Each User Story

- Tests must be written and fail before implementation
- Selector structure and copy changes before final styling refinements
- Active method behavior before polish and documentation
- Story validation before moving to the next dependent story

### Parallel Opportunities

- `T001` and `T002` can run in parallel
- `T006` and `T007` can run in parallel because they target different test files
- `T016` can run in parallel with final verification preparation before `T017`

---

## Parallel Example: User Story 1

```bash
Task: "Extend selector structure and presentation assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for grouped radio-input options, shared-pattern copy, and active-state hooks"
Task: "Extend login shell coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts for the refined radio-style login presentation remaining available on /login"
```

---

## Parallel Example: User Story 2

```bash
Task: "Review and extend passkey-path assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for passkey-selected guidance and selector persistence"
Task: "Prepare passkey-selected spacing and emphasis updates in /Users/nick/code/template-hono-spa/src/client/routes/login.css after the shared selector layout is stable"
```

---

## Parallel Example: User Story 3

```bash
Task: "Extend password fallback assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts for password-selected controls and selector persistence"
Task: "Update the validation notes and shared-pattern expectations in /Users/nick/code/template-hono-spa/specs/019-login-radio-style/quickstart.md and /Users/nick/code/template-hono-spa/specs/019-login-radio-style/contracts/login-radio-style-contract.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate the shared-pattern selector presentation on `/login`

### Incremental Delivery

1. Finish Setup and Foundational work to stabilize the shared selector structure
2. Deliver User Story 1 for the create-account-style selector presentation
3. Deliver User Story 2 for passkey-selected clarity within that presentation
4. Deliver User Story 3 for password fallback within the same selector treatment
5. Finish with documentation updates and full verification

### Parallel Team Strategy

1. One developer stabilizes the shared selector structure and layout hooks
2. During US1, one developer can extend unit coverage while another extends route integration coverage
3. During final polish, one developer can update docs while another prepares the full verification run

---

## Notes

- Every task uses the required checklist format with sequential IDs and exact file paths
- All user-story tasks include the required `[US1]`, `[US2]`, or `[US3]` labels
- Tests are included because the implementation plan explicitly calls for focused regression coverage
- The MVP scope is User Story 1 after Setup and Foundational phases
