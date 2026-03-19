# Tasks: Profile Device List Visibility

**Input**: Design documents from `/specs/051-fix-profile-devices/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Tests are required for this feature because the user explicitly requested regression coverage for the session-restoration sequencing bug.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., `US1`, `US2`)
- Every task below includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing test files to express the regression clearly before changing production behavior.

- [ ] T001 Add reusable authenticated-session and registered-device fixtures in `test/state-polling.spec.ts`
- [ ] T002 [P] Add reusable profile-route source lookups for `src/client/routes/profile.ts` in `test/unit.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lock down the root-cause regression so no user-story work starts without a failing sequencing test.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Write a failing regression test in `test/state-polling.spec.ts` proving `State.listDevices` does not run before `State.restoreSession` resolves
- [ ] T004 Implement a post-session-restoration device-loading trigger in `src/client/state.ts` so device fetches start only after the resolved authenticated session is available
- [ ] T005 Remove or narrow the one-shot `when()` dependency in `src/client/state.ts` and `src/client/util/index.ts` so device loading cannot fire from the initial truthy `RequestState`

**Checkpoint**: Session restoration now governs device loading, and the sequencing regression test passes.

---

## Phase 3: User Story 1 - View Registered Devices (Priority: P1) 🎯 MVP

**Goal**: Authenticated users see their registered devices, including the current device, on the first `/profile` load after session restoration completes.

**Independent Test**: Sign in with an account that has at least one registered device, open `/profile`, and confirm the Devices section shows that device and marks the current device without requiring a refresh.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests before implementation changes for this story and confirm they fail first**

- [ ] T006 [P] [US1] Add source-level regression assertions for populated device rendering and current-device labeling in `test/unit.spec.ts`
- [ ] T007 [P] [US1] Extend authenticated device-list coverage for `GET /api/auth/passkey/devices` and current-session device visibility in `test/integration.spec.ts`

### Implementation for User Story 1

- [ ] T008 [US1] Update authenticated device refresh behavior in `src/client/state.ts` so resolved sessions repopulate `state.devices` on first load and after later auth transitions
- [ ] T009 [US1] Preserve populated-device rendering and current-device labeling in `src/client/routes/profile.ts`
- [ ] T010 [US1] Run targeted verification for `test/state-polling.spec.ts`, `test/unit.spec.ts`, and `test/integration.spec.ts` using the commands documented in `specs/051-fix-profile-devices/quickstart.md`

**Checkpoint**: User Story 1 is independently complete when `/profile` reliably shows the current user’s devices on first load.

---

## Phase 4: User Story 2 - Distinguish Empty And Error States (Priority: P2)

**Goal**: The Devices section never appears as a silent blank area; users can tell whether the list is loading, empty, or failed to load.

**Independent Test**: Simulate a successful zero-device response and a failed device-list response, then verify `/profile` shows explicit empty-state and error-state messaging instead of blank space.

### Tests for User Story 2 ⚠️

- [ ] T011 [US2] Add failing empty-state and device-load-error assertions for `src/client/routes/profile.ts` in `test/unit.spec.ts`

### Implementation for User Story 2

- [ ] T012 [US2] Render an explicit zero-devices empty-state message in `src/client/routes/profile.ts`
- [ ] T013 [US2] Render an explicit device-load-error message in `src/client/routes/profile.ts`
- [ ] T014 [US2] Keep loading, empty, and error transitions aligned with request state in `src/client/state.ts` and `src/client/routes/profile.ts`
- [ ] T015 [US2] Run targeted verification for `test/unit.spec.ts` and `test/state-polling.spec.ts` using the commands in `specs/051-fix-profile-devices/quickstart.md`

**Checkpoint**: User Story 2 is independently complete when blank space is replaced by explicit empty/error messaging.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation updates that apply across the feature.

- [ ] T016 [P] Update regression and manual verification notes in `specs/051-fix-profile-devices/quickstart.md`
- [ ] T017 Run full validation from `package.json` with `npm run lint` and `npm test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: Starts immediately.
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user-story implementation.
- **Phase 3: User Story 1**: Depends on Phase 2 completion.
- **Phase 4: User Story 2**: Depends on Phase 2 completion; recommended after User Story 1 because both stories touch `src/client/routes/profile.ts`.
- **Phase 5: Polish**: Depends on the user stories you intend to ship.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and is the MVP slice.
- **US2 (P2)**: Starts after Phase 2; sequence it after US1 to avoid `test/unit.spec.ts` and `src/client/routes/profile.ts` conflicts.

### Within Each User Story

- Write tests first and confirm they fail.
- Update state orchestration before relying on UI assertions.
- Finish targeted verification before moving to the next story.

---

## Parallel Opportunities

- `T001` and `T002` can run in parallel after the task list is accepted.
- `T006` and `T007` can run in parallel because they touch `test/unit.spec.ts` and `test/integration.spec.ts` separately.
- `T016` can run in parallel with final verification prep, but `T017` must remain the last step.

---

## Parallel Example: User Story 1

```bash
Task: "Add source-level regression assertions for populated device rendering and current-device labeling in test/unit.spec.ts"
Task: "Extend authenticated device-list coverage for GET /api/auth/passkey/devices and current-session device visibility in test/integration.spec.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "Render an explicit zero-devices empty-state message in src/client/routes/profile.ts"
Task: "Draft the matching regression wording updates in specs/051-fix-profile-devices/quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate `/profile` with the targeted regression tests

### Incremental Delivery

1. Finish Setup + Foundational to remove the pre-session device-fetch race
2. Deliver US1 so authenticated users see registered devices on first load
3. Deliver US2 so empty and error outcomes are explicit
4. Finish with quickstart updates and full lint/test validation

### Suggested MVP Scope

- Ship **User Story 1** first. It resolves the reported bug directly and includes the requested regression test for “load devices only after session restoration.”

---

## Notes

- All tasks follow the required checklist format: checkbox, task ID, optional `[P]`, required story label for story tasks, and exact file paths.
- The sequencing bug fix is intentionally blocked by `T003` so implementation cannot proceed without a failing regression test.
- No new dependencies are required by this plan.
