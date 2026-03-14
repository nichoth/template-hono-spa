# Tasks: Signup Navigation And Confirmation

**Input**: Design documents from `/specs/026-signup-route/`
**Prerequisites**: `/Users/nick/code/template-hono-spa/specs/026-signup-route/plan.md`, `/Users/nick/code/template-hono-spa/specs/026-signup-route/spec.md`, `/Users/nick/code/template-hono-spa/specs/026-signup-route/research.md`, `/Users/nick/code/template-hono-spa/specs/026-signup-route/data-model.md`, `/Users/nick/code/template-hono-spa/specs/026-signup-route/contracts/signup-route.md`

**Tests**: Include targeted Vitest coverage in `/Users/nick/code/template-hono-spa/test/unit.spec.ts` and `/Users/nick/code/template-hono-spa/test/integration.spec.ts` because the feature changes client navigation, signup route behavior, and registration outcome contracts.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing auth/nav files and test suites for the signup-route change set.

- [X] T001 Confirm the feature scope and target files in `/Users/nick/code/template-hono-spa/specs/026-signup-route/plan.md`, `/Users/nick/code/template-hono-spa/specs/026-signup-route/contracts/signup-route.md`, and `/Users/nick/code/template-hono-spa/specs/026-signup-route/quickstart.md`
- [X] T002 [P] Reserve dedicated nav/signup confirmation assertions in `/Users/nick/code/template-hono-spa/test/unit.spec.ts` and `/Users/nick/code/template-hono-spa/test/integration.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared auth contract changes required before individual stories can land cleanly.

**⚠️ CRITICAL**: No user story work should start until these tasks are complete.

- [X] T003 Define the confirmation-pending signup response shape in `/Users/nick/code/template-hono-spa/src/client/state.ts`
- [X] T004 [P] Update registration endpoint response handling boundaries in `/Users/nick/code/template-hono-spa/src/server/auth/index.ts` and `/Users/nick/code/template-hono-spa/src/server/index.ts`

**Checkpoint**: The client and server agree that successful signup leads to confirmation-pending guidance instead of an authenticated session.

---

## Phase 3: User Story 1 - Reach Signup From Top Navigation (Priority: P1) 🎯 MVP

**Goal**: Expose `Create Account` in the shared top navigation and route it to `/signup`.

**Independent Test**: Open the app, confirm a `Create Account` navigation link appears in the top navigation, activate it, and verify the app reaches `/signup` without a full-page reload.

### Tests for User Story 1

- [X] T005 [P] [US1] Add failing route-metadata and nav assertions for `Create Account` in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`
- [X] T006 [P] [US1] Add failing shell/navigation coverage for `/signup` reachability in `/Users/nick/code/template-hono-spa/test/integration.spec.ts`

### Implementation for User Story 1

- [X] T007 [US1] Add the shared `Create Account` nav entry in `/Users/nick/code/template-hono-spa/src/client/routes/index.ts`
- [X] T008 [US1] Update shared navigation rendering expectations for the new top-level link in `/Users/nick/code/template-hono-spa/src/client/components/nav.ts`

**Checkpoint**: Users can reach `/signup` directly from the main navigation on the existing client-side app.

---

## Phase 4: User Story 2 - Use A Signup Form That Matches Login Choices (Priority: P1)

**Goal**: Make `/signup` visually and behaviorally align with the login route’s passkey/password selector while keeping `Create account` as the primary action.

**Independent Test**: Open `/signup`, confirm the form includes passkey and password method choices like the login screen, and verify the primary action is clearly labeled `Create account`.

### Tests for User Story 2

- [X] T009 [P] [US2] Add failing signup-route structure assertions in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

### Implementation for User Story 2

- [X] T010 [US2] Update `/signup` route copy, method-selection behavior, and CTA text in `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`
- [X] T011 [US2] Align signup route layout details with the login-route pattern in `/Users/nick/code/template-hono-spa/src/client/routes/signup.css`
- [X] T012 [US2] Reuse shared auth-route helpers or labels as needed between `/login` and `/signup` in `/Users/nick/code/template-hono-spa/src/client/routes/login.ts` and `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`

**Checkpoint**: `/signup` matches the login method selector pattern and presents a clear `Create account` action.

---

## Phase 5: User Story 3 - Receive Email Confirmation Guidance (Priority: P2)

**Goal**: Return and render confirmation-email guidance after successful signup instead of treating the user as fully signed in.

**Independent Test**: Submit the create-account flow with valid details and verify the screen confirms that an email has been sent to the user for address confirmation.

### Tests for User Story 3

- [X] T013 [P] [US3] Add failing signup outcome assertions for confirmation-pending client state in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`
- [X] T014 [P] [US3] Add failing registration endpoint assertions for confirmation-email startup in `/Users/nick/code/template-hono-spa/test/integration.spec.ts`

### Implementation for User Story 3

- [X] T015 [US3] Update client signup submission state and success messaging in `/Users/nick/code/template-hono-spa/src/client/state.ts` and `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`
- [X] T016 [US3] Change registration service outcomes to return confirmation-pending data in `/Users/nick/code/template-hono-spa/src/server/auth/index.ts`
- [X] T017 [US3] Update Hono registration endpoints to emit the revised signup response contract in `/Users/nick/code/template-hono-spa/src/server/index.ts`

**Checkpoint**: Successful signup tells the user to confirm their email address and no longer implies immediate account completion.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the whole feature across automated and manual checks.

- [X] T018 Run `HOME=/tmp npm test` and resolve any regressions in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`, `/Users/nick/code/template-hono-spa/test/integration.spec.ts`, `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`, `/Users/nick/code/template-hono-spa/src/client/state.ts`, `/Users/nick/code/template-hono-spa/src/server/auth/index.ts`, and `/Users/nick/code/template-hono-spa/src/server/index.ts`
- [X] T019 Run `HOME=/tmp npm run lint` and resolve any lint issues in `/Users/nick/code/template-hono-spa/src/client/routes/index.ts`, `/Users/nick/code/template-hono-spa/src/client/components/nav.ts`, `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts`, and `/Users/nick/code/template-hono-spa/test/unit.spec.ts`
- [X] T020 Execute the manual verification flow in `/Users/nick/code/template-hono-spa/specs/026-signup-route/quickstart.md` and update `/Users/nick/code/template-hono-spa/specs/026-signup-route/quickstart.md` if any verification step needs clarification

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 blocks all user stories because the signup success contract changes affect both client and server code.
- Phase 3 delivers the MVP navigation path and can ship independently once foundational contract work is in place.
- Phase 4 depends on Phase 3 because the refined `/signup` route is the destination reached from the new nav link.
- Phase 5 depends on Phase 4 because confirmation-email guidance must render on the final signup route UX.
- Phase 6 depends on all implementation phases being complete.

### User Story Dependencies

- **US1**: Starts after Phase 2 and has no dependency on later stories.
- **US2**: Starts after US1 because it refines the `/signup` experience reached through the new top-nav link.
- **US3**: Starts after US2 because confirmation guidance must integrate with the finalized signup form behavior.

### Parallel Opportunities

- `T002` can run in parallel with `T001` because it only touches existing test files.
- `T004` can run in parallel with `T003` because it stays on the server contract side while `T003` defines client state types.
- Within each user story, the failing test tasks marked `[P]` can be prepared in parallel before implementation begins.

---

## Parallel Example: User Story 1

```bash
Task: "Add failing route-metadata and nav assertions for Create Account in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Add failing shell/navigation coverage for /signup reachability in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add failing signup-route structure assertions in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Review signup route copy and layout differences in /Users/nick/code/template-hono-spa/src/client/routes/signup.ts and /Users/nick/code/template-hono-spa/src/client/routes/signup.css"
```

## Parallel Example: User Story 3

```bash
Task: "Add failing signup outcome assertions for confirmation-pending client state in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Add failing registration endpoint assertions for confirmation-email startup in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for the top-nav path to `/signup`.
3. Validate that users can reach the signup route from the main navigation.
4. Stop if the navigation-only MVP is sufficient for immediate review.

### Incremental Delivery

1. Deliver US1 to expose signup in the main navigation.
2. Deliver US2 to align `/signup` with the login selector experience.
3. Deliver US3 to switch signup success into confirmation-email guidance.
4. Finish with automated and manual verification in Phase 6.
