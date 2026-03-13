# Tasks: Dedicated Signup Route

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/024-signup-route/`
**Prerequisites**: [plan.md](/Users/nick/code/template-hono-spa/specs/024-signup-route/plan.md) (required), [spec.md](/Users/nick/code/template-hono-spa/specs/024-signup-route/spec.md) (required for user stories), [research.md](/Users/nick/code/template-hono-spa/specs/024-signup-route/research.md), [data-model.md](/Users/nick/code/template-hono-spa/specs/024-signup-route/data-model.md), [signup-route-ui-contract.md](/Users/nick/code/template-hono-spa/specs/024-signup-route/contracts/signup-route-ui-contract.md)

**Tests**: Add and update regression coverage for the new route, route-to-route navigation, and signup-versus-login endpoint usage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the new route files and route registration surface needed by later stories

- [ ] T001 [P] Create the dedicated signup route module in `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`
- [ ] T002 [P] Create the dedicated signup route stylesheet in `/Users/nick/code/template-hono-spa/src/client/routes/signup.css`
- [ ] T003 Register `/signup` in the client route table and router in `/Users/nick/code/template-hono-spa/src/client/routes/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared client state and baseline regression coverage that all stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Extend auth client state with signup submission helpers that target account-creation endpoints in `/Users/nick/code/template-hono-spa/src/client/state.ts`
- [ ] T005 [P] Add unit coverage for route registration and signup-versus-login API path intent in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`
- [ ] T006 [P] Add integration coverage for `/login` to `/signup` navigation and direct `/signup` rendering in `/Users/nick/code/template-hono-spa/test/integration.spec.ts`

**Checkpoint**: Foundation ready; story work can proceed independently

---

## Phase 3: User Story 1 - Reach Signup From Login (Priority: P1) 🎯 MVP

**Goal**: Let a visitor reach the dedicated signup screen directly from the login screen

**Independent Test**: Open `/login`, confirm there is a visible create-account link near the primary sign-in action, activate it, and confirm navigation reaches `/signup` without breaking sign-in controls.

### Implementation for User Story 1

- [ ] T007 [US1] Add the visible create-account link and route-specific action copy to `/Users/nick/code/template-hono-spa/src/client/routes/login.ts`
- [ ] T008 [US1] Style the login route secondary create-account link and action row in `/Users/nick/code/template-hono-spa/src/client/routes/login.css`
- [ ] T009 [US1] Implement the initial `/signup` route shell with create-account heading and back-to-sign-in link in `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`
- [ ] T010 [US1] Style the `/signup` route shell to match the login layout language in `/Users/nick/code/template-hono-spa/src/client/routes/signup.css`

**Checkpoint**: User Story 1 is independently testable via route navigation alone

---

## Phase 4: User Story 2 - Create Account On Dedicated Signup Screen (Priority: P1)

**Goal**: Let a new user use the shared radio selector on `/signup` and submit account creation through the registration path

**Independent Test**: Open `/signup`, confirm the shared radio-button selector appears, fill the visible create-account form, and verify submission uses the account-creation path instead of the sign-in path.

### Implementation for User Story 2

- [ ] T011 [US2] Add signup form state, validation, and radio-selector behavior to `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`
- [ ] T012 [US2] Wire passkey account creation through the registration start/finish flow in `/Users/nick/code/template-hono-spa/src/client/state.ts`
- [ ] T013 [US2] Add method-specific create-account layout and field styles to `/Users/nick/code/template-hono-spa/src/client/routes/signup.css`
- [ ] T014 [US2] Extend regression coverage for selector behavior and registration-path submission in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

**Checkpoint**: User Story 2 is independently testable from `/signup`

---

## Phase 5: User Story 3 - Keep Sign-In Focused On Existing Accounts (Priority: P2)

**Goal**: Preserve `/login` as a sign-in-only screen while keeping route-specific messaging distinct between login and signup

**Independent Test**: Open `/login` and confirm it shows sign-in-only actions with no inline create-account button, then open `/signup` and confirm account-creation messaging stays separate.

### Implementation for User Story 3

- [ ] T015 [US3] Remove or refactor any remaining create-account-only logic from the login route in `/Users/nick/code/template-hono-spa/src/client/routes/login.ts`
- [ ] T016 [US3] Separate signup-versus-login messaging, return-link behavior, and method-specific copy in `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`
- [ ] T017 [US3] Extend end-to-end route regression coverage for login-only actions and `/signup` direct entry in `/Users/nick/code/template-hono-spa/test/integration.spec.ts`

**Checkpoint**: User Story 3 is independently testable by comparing `/login` and `/signup`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and feature-specific verification updates

- [ ] T018 [P] Update manual validation steps to match final route behavior in `/Users/nick/code/template-hono-spa/specs/024-signup-route/quickstart.md`
- [ ] T019 [P] Update the final signup/login UI contract language in `/Users/nick/code/template-hono-spa/specs/024-signup-route/contracts/signup-route-ui-contract.md`
- [ ] T020 [P] Update route usage docs for `/login` and `/signup` in `/Users/nick/code/template-hono-spa/README.example.md`
- [ ] T021 Clean final sign-in route copy and UI consistency in `/Users/nick/code/template-hono-spa/src/client/routes/login.ts`
- [ ] T022 Clean final signup route copy and UI consistency in `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; starts immediately
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: US1**: Depends on Phase 2; delivers the MVP navigation path
- **Phase 4: US2**: Depends on Phase 2; can follow US1 once the route exists
- **Phase 5: US3**: Depends on Phase 2; should land after US1/US2 route behavior is in place
- **Phase 6: Polish**: Depends on all targeted stories being complete

### User Story Dependencies

- **US1**: Starts after Foundational with no dependency on other stories
- **US2**: Starts after Foundational; benefits from the `/signup` route shell from US1
- **US3**: Starts after Foundational; validates the final separation between `/login` and `/signup`

### Within Each User Story

- Regression tests for touched behavior should be updated before or alongside implementation
- Route shell before route styling
- State helpers before submission wiring
- Route-specific copy cleanup after the main behaviors are working

### Parallel Opportunities

- **Setup**: `T001` and `T002` can run in parallel
- **Foundational**: `T005` and `T006` can run in parallel after `T004`
- **Polish**: `T018`, `T019`, and `T020` can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Add the visible create-account link and route-specific action copy to /Users/nick/code/template-hono-spa/src/client/routes/login.ts"
Task: "Implement the initial /signup route shell with create-account heading and back-to-sign-in link in /Users/nick/code/template-hono-spa/src/client/routes/signup.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Wire passkey account creation through the registration start/finish flow in /Users/nick/code/template-hono-spa/src/client/state.ts"
Task: "Add method-specific create-account layout and field styles to /Users/nick/code/template-hono-spa/src/client/routes/signup.css"
```

## Parallel Example: User Story 3

```bash
Task: "Remove or refactor any remaining create-account-only logic from the login route in /Users/nick/code/template-hono-spa/src/client/routes/login.ts"
Task: "Extend end-to-end route regression coverage for login-only actions and /signup direct entry in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `/login` → `/signup` navigation before expanding the form behavior

### Incremental Delivery

1. Deliver `/signup` reachability and shell
2. Add real create-account behavior on `/signup`
3. Tighten route-role separation so `/login` stays sign-in only
4. Finish with docs and copy cleanup

### Parallel Team Strategy

1. One developer handles client state and API submission wiring
2. One developer handles route shells and styling
3. One developer maintains unit and integration coverage as the route pair evolves

---

## Notes

- [P] tasks touch different files and avoid incomplete-task dependencies
- Every story is scoped so it can be validated on its own route behavior
- Signup submission must stay distinct from login submission even when the selector looks shared
- Login must remain sign-in only throughout implementation
