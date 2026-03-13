# Tasks: Real Passkey Login Backend

**Input**: Design documents from `/specs/023-passkey-auth-backend/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/passkey-auth-api-contract.md`, `quickstart.md`

**Tests**: Include unit and integration coverage for auth contracts, D1-backed persistence behavior, and end-to-end session flows.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish auth-specific project scaffolding and runtime configuration entry points.

- [X] T001 Create auth server module scaffolding in `/Users/nick/code/template-hono-spa/src/server/auth/index.ts`
- [X] T002 [P] Create database module scaffolding in `/Users/nick/code/template-hono-spa/src/server/db/index.ts`
- [X] T003 [P] Add auth persistence binding placeholders and environment comments in `/Users/nick/code/template-hono-spa/wrangler.jsonc`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared auth foundation that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create the D1 auth schema and migration bootstrap in `/Users/nick/code/template-hono-spa/src/server/db/schema.ts`
- [X] T005 [P] Define Worker auth binding and session typing in `/Users/nick/code/template-hono-spa/src/worker-configuration.d.ts`
- [X] T006 [P] Implement shared D1 repository helpers for users, credentials, challenges, sessions, and auth events in `/Users/nick/code/template-hono-spa/src/server/db/index.ts`
- [X] T007 [P] Implement shared WebAuthn challenge, verification, and session token utilities in `/Users/nick/code/template-hono-spa/src/server/auth/index.ts`
- [X] T008 Wire auth bindings and shared middleware hooks into the Worker app in `/Users/nick/code/template-hono-spa/src/server/index.ts`
- [X] T009 Add foundational auth repository and binding regression coverage in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

**Checkpoint**: Foundation ready for registration, login, and session lifecycle work.

---

## Phase 3: User Story 1 - Create an account with a passkey (Priority: P1) 🎯 MVP

**Goal**: Allow a new visitor to register an account, store a passkey credential, and land in an authenticated session.

**Independent Test**: Start sign-up, complete passkey registration, and confirm a persisted user, credential, and authenticated session are created.

### Tests for User Story 1

- [X] T010 [P] [US1] Add registration contract coverage for start and finish endpoints in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`
- [X] T011 [P] [US1] Add end-to-end registration integration coverage in `/Users/nick/code/template-hono-spa/test/integration.spec.ts`

### Implementation for User Story 1

- [X] T012 [P] [US1] Implement registration-start and registration-finish auth service logic in `/Users/nick/code/template-hono-spa/src/server/auth/index.ts`
- [X] T013 [US1] Add `/api/auth/register/start` and `/api/auth/register/finish` endpoints in `/Users/nick/code/template-hono-spa/src/server/index.ts`
- [X] T014 [US1] Implement client signup passkey ceremony request/response handling in `/Users/nick/code/template-hono-spa/src/client/state.ts`
- [X] T015 [US1] Connect the signup route to the real registration flow and success/error states in `/Users/nick/code/template-hono-spa/src/client/routes/login.ts`

**Checkpoint**: New users can register a passkey-backed account and receive a session.

---

## Phase 4: User Story 2 - Sign in with an existing passkey (Priority: P2)

**Goal**: Let a returning user complete a passkey sign-in and receive a new authenticated session.

**Independent Test**: Begin a passkey login for an existing account, complete the assertion, and confirm a valid session is created and returned.

### Tests for User Story 2

- [X] T016 [P] [US2] Add passkey login contract coverage for start and finish endpoints in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`
- [X] T017 [P] [US2] Add returning-user passkey login integration coverage in `/Users/nick/code/template-hono-spa/test/integration.spec.ts`

### Implementation for User Story 2

- [X] T018 [P] [US2] Implement login-start and login-finish auth service logic in `/Users/nick/code/template-hono-spa/src/server/auth/index.ts`
- [X] T019 [US2] Add `/api/auth/login/start` and `/api/auth/login/finish` endpoints in `/Users/nick/code/template-hono-spa/src/server/index.ts`
- [X] T020 [US2] Implement real passkey login ceremony handling in `/Users/nick/code/template-hono-spa/src/client/state.ts`
- [X] T021 [US2] Connect the login route to the real passkey login flow and failure states in `/Users/nick/code/template-hono-spa/src/client/routes/login.ts`

**Checkpoint**: Existing users can sign in with a stored passkey and receive a fresh session.

---

## Phase 5: User Story 3 - Manage authenticated session state safely (Priority: P3)

**Goal**: Restore the current session, support sign-out, and reject expired or invalid sessions.

**Independent Test**: After sign-in, fetch the current session user, sign out, and confirm the prior session no longer authenticates requests.

### Tests for User Story 3

- [X] T022 [P] [US3] Add current-session and logout contract coverage in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`
- [X] T023 [P] [US3] Add session restoration and sign-out integration coverage in `/Users/nick/code/template-hono-spa/test/integration.spec.ts`

### Implementation for User Story 3

- [X] T024 [P] [US3] Implement current-session lookup, invalidation, and expiry handling in `/Users/nick/code/template-hono-spa/src/server/auth/index.ts`
- [X] T025 [US3] Add `/api/session` and `/api/logout` endpoints in `/Users/nick/code/template-hono-spa/src/server/index.ts`
- [X] T026 [US3] Implement session restoration and logout client state handling in `/Users/nick/code/template-hono-spa/src/client/state.ts`
- [X] T027 [US3] Render authenticated-session restoration and logout behavior in `/Users/nick/code/template-hono-spa/src/client/routes/login.ts`

**Checkpoint**: Session restoration and sign-out are fully enforced by the backend.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs, config clarity, and complete full-feature verification.

- [X] T028 [P] Add D1 and backend service setup documentation to `/Users/nick/code/template-hono-spa/README.md`
- [X] T029 [P] Update auth binding, D1 setup, and local workflow documentation in `/Users/nick/code/template-hono-spa/specs/023-passkey-auth-backend/quickstart.md`
- [X] T030 [P] Update the feature contract and implementation notes for final endpoint, binding, and setup documentation names in `/Users/nick/code/template-hono-spa/specs/023-passkey-auth-backend/contracts/passkey-auth-api-contract.md`
- [X] T031 Finalize `wrangler.jsonc` auth binding entries for default and staging environments in `/Users/nick/code/template-hono-spa/wrangler.jsonc`
- [X] T032 Run end-to-end verification updates and close the task checklist in `/Users/nick/code/template-hono-spa/specs/023-passkey-auth-backend/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: Starts immediately.
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3: User Story 1**: Depends on Phase 2 and delivers the MVP.
- **Phase 4: User Story 2**: Depends on Phase 2; logically builds on the shared auth foundation and registration-created account model.
- **Phase 5: User Story 3**: Depends on Phase 2 and uses sessions created in US1 and US2.
- **Phase 6: Polish**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1**: No dependency on other user stories after foundational work.
- **US2**: No implementation dependency on US1 code paths, but it assumes persisted credentials and account records created by the shared auth foundation.
- **US3**: No implementation dependency on US1 or US2 route work, but it depends on the shared session model established in foundational work.

### Within Each User Story

- Tests should be added before or alongside implementation and must fail before the feature code is considered complete.
- Shared service logic precedes route endpoint wiring.
- Backend endpoint support precedes client integration.
- Client state precedes route-level UX completion.

### Parallel Opportunities

- `T002` and `T003`
- `T005`, `T006`, and `T007`
- `T010` and `T011`
- `T012` can proceed in parallel with `T010`/`T011` once the foundation is stable
- `T016` and `T017`
- `T018` can proceed in parallel with `T016`/`T017`
- `T022` and `T023`
- `T024` can proceed in parallel with `T022`/`T023`
- `T028`, `T029`, and `T030`

---

## Parallel Example: User Story 1

```bash
Task: "Add registration contract coverage for start and finish endpoints in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Add end-to-end registration integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

```bash
Task: "Implement registration-start and registration-finish auth service logic in /Users/nick/code/template-hono-spa/src/server/auth/index.ts"
Task: "Add registration contract coverage for start and finish endpoints in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "Add passkey login contract coverage for start and finish endpoints in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Add returning-user passkey login integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

---

## Parallel Example: User Story 3

```bash
Task: "Add current-session and logout contract coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Add session restoration and sign-out integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup.
2. Complete Foundational work, including D1 schema helpers and `wrangler.jsonc` binding scaffolding.
3. Complete User Story 1.
4. Validate that registration creates a persisted user, passkey credential, and session.

### Incremental Delivery

1. Deliver Setup + Foundational infrastructure.
2. Deliver US1 for new-account registration.
3. Deliver US2 for returning-user passkey sign-in.
4. Deliver US3 for session restoration and sign-out.
5. Finish with config/documentation polish and final verification.

### Parallel Team Strategy

1. One developer finalizes D1 and Worker bindings while another builds shared auth utilities during Foundational work.
2. After Foundation, backend contract tests and integration tests can be written in parallel with service implementation.
3. Client state and route integration can follow once endpoints are stable.

---

## Notes

- `[P]` tasks are limited to work on separate files or non-blocking parallel streams.
- All user-story tasks include exact absolute file paths.
- The MVP scope is Setup + Foundational + User Story 1.
