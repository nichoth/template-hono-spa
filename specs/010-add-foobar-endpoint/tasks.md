# Tasks: Foobar API Endpoint

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/010-add-foobar-endpoint/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include integration tests for endpoint success behavior, unsupported method handling, and non-regression checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare baseline route and verification context for the new endpoint.

- [X] T001 Confirm current API routing touchpoints and endpoint placement in `src/server/index.ts`
- [X] T002 Confirm existing integration test structure and baseline coverage in `test/integration.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared response contract and route scaffolding before story-specific behavior.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Define stable `/api/foobar` success payload shape constants in `src/server/index.ts`
- [X] T004 [P] Ensure shared API response conventions (JSON content type and safe error shape) are aligned in `src/server/index.ts`
- [X] T005 Add foundational `/api/foobar` route skeleton for GET-only handling in `src/server/index.ts`

**Checkpoint**: Foundation ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Retrieve Foobar JSON Response (Priority: P1) 🎯 MVP

**Goal**: Deliver `GET /api/foobar` with stable JSON and correct response metadata.

**Independent Test**: `GET /api/foobar` returns HTTP 200, parseable JSON, and JSON content type.

### Tests for User Story 1

- [X] T006 [US1] Add integration test for `GET /api/foobar` success status and JSON parseability in `test/integration.spec.ts`
- [X] T007 [US1] Add integration test for `/api/foobar` JSON content type header in `test/integration.spec.ts`

### Implementation for User Story 1

- [X] T008 [US1] Implement finalized `GET /api/foobar` JSON response in `src/server/index.ts`
- [X] T009 [US1] Ensure top-level response fields remain stable for client contract use in `src/server/index.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Handle Unsupported Methods Predictably (Priority: P2)

**Goal**: Return predictable non-2xx outcomes for unsupported methods without leaking internal details.

**Independent Test**: `POST /api/foobar` returns non-2xx with safe response body behavior, while existing API routes remain unchanged.

### Tests for User Story 2

- [X] T010 [US2] Add integration test for unsupported method non-2xx behavior on `/api/foobar` in `test/integration.spec.ts`
- [X] T011 [US2] Add integration test that `/api/health` behavior remains unchanged after endpoint addition in `test/integration.spec.ts`

### Implementation for User Story 2

- [X] T012 [US2] Implement explicit unsupported-method handling path for `/api/foobar` in `src/server/index.ts`
- [X] T013 [US2] Ensure unsupported-method responses do not expose sensitive internals in `src/server/index.ts`

**Checkpoint**: User Stories 1 and 2 are independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation alignment.

- [X] T014 [P] Update endpoint verification guidance in `specs/010-add-foobar-endpoint/quickstart.md`
- [X] T015 Run repository validation commands from `/Users/nick/code/template-hono-spa` using `npm run lint` and `HOME=/tmp npm test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all story work.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should run after US1 due shared file edits.
- **Polish (Phase 5)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2; forms MVP release slice.
- **US2 (P2)**: Can start after Phase 2; should run after US1 because both touch `src/server/index.ts` and `test/integration.spec.ts`.

### Within Each User Story

- Write and run story tests before finalizing implementation tasks.
- Complete route behavior updates before cross-route regression checks.

### Parallel Opportunities

- `T003` and `T004` can run in parallel.
- `T014` can run in parallel with final validation prep.

---

## Parallel Example: User Story 1

```bash
Task: "Define stable /api/foobar success payload shape constants in src/server/index.ts"  # T003
Task: "Ensure shared API response conventions are aligned in src/server/index.ts"  # T004
```

## Parallel Example: User Story 2

```bash
Task: "Draft unsupported-method and non-regression assertions in test/integration.spec.ts"  # aligns with T010/T011
Task: "Refine unsupported-method response behavior in src/server/index.ts"  # aligns with T012/T013
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate `GET /api/foobar` independently.

### Incremental Delivery

1. Deliver US1 for successful endpoint contract.
2. Deliver US2 for method safety and non-regression behavior.
3. Finish polish validation and docs alignment.

### Parallel Team Strategy

1. Split foundational contract/scaffolding prep tasks.
2. Merge into shared route file changes sequentially.
3. Keep test updates and route updates coordinated because they share the same files.

---

## Notes

- Every task follows strict checklist format with ID and explicit file paths.
- User-story phases map directly to spec priorities (P1, then P2).
- Scope intentionally remains limited to the server endpoint and related tests/docs.
