# Tasks: Login Route

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/015-login-route/`
**Prerequisites**: [plan.md](/Users/nick/code/template-hono-spa/specs/015-login-route/plan.md), [spec.md](/Users/nick/code/template-hono-spa/specs/015-login-route/spec.md), [research.md](/Users/nick/code/template-hono-spa/specs/015-login-route/research.md), [data-model.md](/Users/nick/code/template-hono-spa/specs/015-login-route/data-model.md), [login-route-contract.md](/Users/nick/code/template-hono-spa/specs/015-login-route/contracts/login-route-contract.md), [quickstart.md](/Users/nick/code/template-hono-spa/specs/015-login-route/quickstart.md)

**Tests**: Automated tests are required for this feature because the implementation plan explicitly calls for route, shell, and login behavior coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Each task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the shared component and style wiring that every login story depends on.

- [X] T001 [P] Import `@substrate-system/input/css` and `@substrate-system/password-input/css` in /Users/nick/code/template-hono-spa/src/style.css
- [X] T002 [P] Register the login form web components in /Users/nick/code/template-hono-spa/src/client/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared route surface and rendering guardrails required before story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Modify /Users/nick/code/template-hono-spa/src/client/routes/index.ts to add `/login` route metadata and router mapping
- [X] T004 [P] Create the route scaffold and exported helpers in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T005 [P] Create shared login route styling in /Users/nick/code/template-hono-spa/src/client/routes/login.css
- [X] T006 Update /Users/nick/code/template-hono-spa/test/migration-rendering.spec.ts to include `/src/client/routes/login.ts` in the migrated client render file list

**Checkpoint**: Foundation ready for independently testable login route work

---

## Phase 3: User Story 1 - Open the login page (Priority: P1) 🎯 MVP

**Goal**: Deliver a reachable `/login` page that renders the requested form controls on a direct visit or client-side transition.

**Independent Test**: Navigate directly to `/login` and confirm the page loads with a recognizable login heading, a username-or-email field, a password field, and a submit action.

### Tests for User Story 1

- [X] T007 [P] [US1] Extend route metadata and known-route assertions for `/login` in /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [X] T008 [P] [US1] Add app-shell deep-link coverage for `http://localhost/login` in /Users/nick/code/template-hono-spa/test/integration.spec.ts

### Implementation for User Story 1

- [X] T009 [US1] Implement the `/login` page structure with heading, identifier field, password field, and submit button in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T010 [US1] Update navigation rendering so the login route is reachable from the shared nav in /Users/nick/code/template-hono-spa/src/client/components/nav.ts

**Checkpoint**: `/login` renders as a first-class client route and is testable on its own

---

## Phase 4: User Story 2 - Correct incomplete form input (Priority: P2)

**Goal**: Show clear local validation feedback for incomplete submissions while preserving valid entered values.

**Independent Test**: Open `/login`, submit the form with one or more required fields left empty, and confirm the page shows actionable validation feedback without leaving the route.

### Tests for User Story 2

- [X] T011 [P] [US2] Add validation helper coverage for missing-field errors and value preservation in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 2

- [X] T012 [US2] Implement local login form state, missing-field validation, and error rendering in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T013 [US2] Refine layout and error-state styling for validation feedback in /Users/nick/code/template-hono-spa/src/client/routes/login.css

**Checkpoint**: Incomplete login submissions show corrective feedback without breaking the route or clearing valid field values

---

## Phase 5: User Story 3 - Submit the UI-only login form (Priority: P3)

**Goal**: Complete the form interaction by showing a non-authenticating status message after a valid submit.

**Independent Test**: Open `/login`, complete both required fields, submit the form, and confirm the page stays in place while showing a non-destructive message that login processing is not yet connected.

### Tests for User Story 3

- [X] T014 [P] [US3] Add unit coverage for successful UI-only submit messaging in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 3

- [X] T015 [US3] Implement valid-submit status messaging and no-op submit behavior in /Users/nick/code/template-hono-spa/src/client/routes/login.ts
- [X] T016 [US3] Update `/login` integration expectations so existing routes remain unchanged after the login route addition in /Users/nick/code/template-hono-spa/test/integration.spec.ts

**Checkpoint**: Valid login form submission stays on `/login` and clearly communicates that no real sign-in occurred

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation aligned with the planned validation flow

- [X] T017 Run the manual validation flow documented in /Users/nick/code/template-hono-spa/specs/015-login-route/quickstart.md
- [X] T018 Run repository validation with `npm run lint` and `HOME=/tmp npm test`, then record the outcome in /Users/nick/code/template-hono-spa/specs/015-login-route/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story work
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 because validation is layered on the login route structure created there
- **User Story 3 (Phase 5)**: Depends on User Story 2 because the success message shares the same local form state and submit flow
- **Polish (Phase 6)**: Depends on all story phases completing

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational and is the recommended MVP slice
- **US2 (P2)**: Starts after US1 because it extends the same route component with validation behavior
- **US3 (P3)**: Starts after US2 because it extends the same submit path with UI-only success messaging

### Within Each User Story

- Test tasks should be written first and observed failing before implementation
- Route behavior comes before styling refinements
- Story-specific verification should complete before moving to the next story

### Parallel Opportunities

- `T001` and `T002` can run in parallel during Setup
- `T004` and `T005` can run in parallel once the route entry plan from `T003` is clear
- `T007` and `T008` can run in parallel for US1 coverage
- US2 has one parallelizable test task before implementation
- US3 has one parallelizable test task before implementation

---

## Parallel Example: User Story 1

```bash
Task: "Extend route metadata and known-route assertions for /login in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Add app-shell deep-link coverage for http://localhost/login in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

## Parallel Example: Setup

```bash
Task: "Import @substrate-system/input/css and @substrate-system/password-input/css in /Users/nick/code/template-hono-spa/src/style.css"
Task: "Register the login form web components in /Users/nick/code/template-hono-spa/src/client/index.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `/login` direct-load and route rendering behavior

### Incremental Delivery

1. Deliver US1 to establish the route and visible form structure
2. Add US2 to handle incomplete form submission with clear guidance
3. Add US3 to complete the bounded UI-only submit flow
4. Finish with quickstart and full repo validation

### Suggested MVP Scope

- **MVP**: User Story 1 only
- **Why**: It delivers the new `/login` route and visible login form with the least scope and no submit-state complexity

## Notes

- All tasks follow the required checklist format with checkbox, task ID, story label where required, and exact file paths
- No backend authentication, API, or session tasks are included because the feature is explicitly UI-only
- The login route touches shared route infrastructure, so `test/migration-rendering.spec.ts` is included to keep migration guards accurate
