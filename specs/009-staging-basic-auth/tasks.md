# Tasks: Staging Deploy Password Gate

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/009-staging-basic-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include integration tests for environment gating and HTTP basic-auth behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare config surface for branch-aware access control.

- [X] T001 Add staging-auth runtime variable placeholders for local/test config in `wrangler.jsonc` and `wrangler.test.jsonc`
- [X] T002 Add access-control environment bindings/types in `src/server/index.ts` and `worker-configuration.d.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core request-gating primitives required before story behavior implementation.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create deployment-context resolver utilities in `src/server/deployment-context.ts`
- [X] T004 [P] Create HTTP basic-auth parsing and credential-check utilities in `src/server/basic-auth.ts`
- [X] T005 Implement reusable unauthorized challenge response helper in `src/server/access-response.ts`
- [X] T006 Integrate foundational access-control imports and middleware wiring points in `src/server/index.ts`

**Checkpoint**: Foundation ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Protect Staging Deploy Access (Priority: P1) 🎯 MVP

**Goal**: Require HTTP basic-auth on staging/preview deploy requests and deny unauthorized traffic.

**Independent Test**: Staging requests without credentials are challenged; staging requests with valid credentials load API and SPA routes.

### Tests for User Story 1

- [X] T007 [US1] Add integration coverage for staging unauthenticated challenge behavior in `test/integration.spec.ts`
- [X] T008 [US1] Add integration coverage for staging valid-credential access in `test/integration.spec.ts`

### Implementation for User Story 1

- [X] T009 [US1] Implement staging/preview auth gate middleware flow in `src/server/index.ts`
- [X] T010 [US1] Apply auth gate consistently to SPA-shell and API-serving request paths in `src/server/index.ts`
- [X] T011 [US1] Ensure malformed or invalid authorization headers are denied with challenge semantics in `src/server/index.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Keep Main Deploy Public (Priority: P2)

**Goal**: Keep main-branch deployment accessible without authentication while preserving staging protection.

**Independent Test**: Main deploy traffic returns normal responses without auth challenge while staging remains protected.

### Tests for User Story 2

- [X] T012 [US2] Add integration coverage for main-deploy no-auth-required behavior in `test/integration.spec.ts`
- [X] T013 [US2] Add integration coverage proving main remains open while staging stays gated in `test/integration.spec.ts`

### Implementation for User Story 2

- [X] T014 [US2] Implement explicit main-deployment auth bypass condition in `src/server/index.ts`
- [X] T015 [US2] Add fallback handling for missing/ambiguous deploy context to default non-main protection in `src/server/index.ts`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation updates across all stories.

- [X] T016 [P] Update feature verification instructions for auth scenarios in `specs/009-staging-basic-auth/quickstart.md`
- [X] T017 Run full verification suite via scripts in `package.json` from `/Users/nick/code/template-hono-spa`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and shares server gating logic with US1.
- **Polish (Phase 5)**: Depends on completion of US1 and US2.

### User Story Dependencies

- **US1 (P1)**: Can start once Phase 2 is complete.
- **US2 (P2)**: Can start once Phase 2 is complete; should be executed after US1 because both modify `src/server/index.ts` and `test/integration.spec.ts`.

### Within Each User Story

- Add and run tests for the story before finalizing implementation changes.
- Complete middleware/routing logic before cross-story verification.

### Parallel Opportunities

- `T003` and `T004` can run in parallel (new, separate utility files).
- `T016` can run in parallel with final verification prep tasks.

---

## Parallel Example: User Story 1

```bash
Task: "Create deployment-context resolver utilities in src/server/deployment-context.ts"  # T003
Task: "Create HTTP basic-auth parsing and credential-check utilities in src/server/basic-auth.ts"  # T004
```

## Parallel Example: User Story 2

```bash
Task: "Prepare main-deploy integration scenario assertions in test/integration.spec.ts"  # aligns with T012/T013 sequencing
Task: "Draft main-bypass and fallback condition branches in src/server/index.ts"  # aligns with T014/T015 sequencing
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate staging challenge + valid credential flow.

### Incremental Delivery

1. Deliver US1 as secure staging gate MVP.
2. Add US2 to preserve main deploy public access.
3. Run full verification and finalize docs updates.

### Parallel Team Strategy

1. One developer handles foundational utilities (`T003`, `T004`).
2. Another developer prepares integration test structure in `test/integration.spec.ts`.
3. Merge to sequential server/index integration tasks to avoid file conflicts.

---

## Notes

- All tasks use the required checklist format with task IDs and file paths.
- Story phases are independently testable against acceptance scenarios in `spec.md`.
- Keep credential values in runtime secrets only; do not commit plaintext credentials.
