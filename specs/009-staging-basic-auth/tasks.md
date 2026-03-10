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

**Purpose**: Prepare configuration surfaces and environment bindings for branch-aware access control.

- [ ] T001 Add deploy-context and auth realm runtime variable placeholders in `wrangler.jsonc`
- [ ] T002 Add test runtime variables for main/staging auth scenarios in `wrangler.test.jsonc`
- [ ] T003 Add access-control environment binding types in `src/server/index.ts` and `worker-configuration.d.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build reusable request-gating primitives required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Create deployment environment classification utility in `src/server/deployment-context.ts`
- [ ] T005 [P] Create HTTP basic-auth parsing and credential validation utility in `src/server/basic-auth.ts`
- [ ] T006 Create unauthorized challenge response helper in `src/server/access-response.ts`
- [ ] T007 Integrate foundational auth middleware wiring points in `src/server/index.ts`

**Checkpoint**: Foundation ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Protect Staging Deploy Access (Priority: P1) 🎯 MVP

**Goal**: Require HTTP basic auth for staging/preview deployments and deny unauthorized access.

**Independent Test**: Staging requests without credentials receive 401 challenge; staging requests with valid credentials are served normally.

### Tests for User Story 1

- [ ] T008 [US1] Add integration test for staging unauthenticated challenge in `test/integration.spec.ts`
- [ ] T009 [US1] Add integration test for staging valid credentials access in `test/integration.spec.ts`
- [ ] T010 [US1] Add integration test for malformed/invalid staging authorization handling in `test/integration.spec.ts`

### Implementation for User Story 1

- [ ] T011 [US1] Implement staging/preview auth gate decision flow in `src/server/index.ts`
- [ ] T012 [US1] Enforce challenge response on missing or invalid staging credentials in `src/server/index.ts`
- [ ] T013 [US1] Apply staging auth gate consistently across shell, API, and asset-serving request paths in `src/server/index.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Keep Main Deploy Public (Priority: P2)

**Goal**: Keep main deployment publicly accessible without auth prompts while preserving staging protection.

**Independent Test**: Main requests return 200 without auth headers, and staging requests remain challenged without credentials.

### Tests for User Story 2

- [ ] T014 [US2] Add integration test for main deployment no-auth behavior in `test/integration.spec.ts`
- [ ] T015 [US2] Add integration test confirming main-open/staging-protected behavior matrix in `test/integration.spec.ts`

### Implementation for User Story 2

- [ ] T016 [US2] Implement explicit main-branch auth bypass in `src/server/index.ts`
- [ ] T017 [US2] Implement missing/ambiguous branch fallback to protected mode in `src/server/deployment-context.ts`

**Checkpoint**: User Stories 1 and 2 are independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, validation, and release readiness checks.

- [ ] T018 [P] Update manual verification commands for auth scenarios in `specs/009-staging-basic-auth/quickstart.md`
- [ ] T019 Run full validation scripts in `package.json` (`npm run lint` and `HOME=/tmp npm test`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all story work.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow US1 due shared files.
- **Polish (Phase 5)**: Depends on US1 and US2 completion.

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Phase 2.
- **US2 (P2)**: Can start after Phase 2; execute after US1 to avoid collisions in `src/server/index.ts` and `test/integration.spec.ts`.

### Within Each User Story

- Write story tests before implementation tasks for that story.
- Complete middleware/decision logic before final story validation.

### Parallel Opportunities

- `T004` and `T005` are parallel (separate foundational utility files).
- `T018` can run in parallel with final pre-release checks.

---

## Parallel Example: User Story 1

```bash
Task: "Create deployment environment classification utility in src/server/deployment-context.ts"  # T004
Task: "Create HTTP basic-auth parsing and credential validation utility in src/server/basic-auth.ts"  # T005
```

## Parallel Example: User Story 2

```bash
Task: "Draft additional main-vs-staging assertions in test/integration.spec.ts"  # aligns with T014/T015
Task: "Refine branch fallback decision logic in src/server/deployment-context.ts"  # aligns with T017
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate staging challenge and valid credential flow.

### Incremental Delivery

1. Deliver US1 for protected staging access.
2. Deliver US2 to preserve public main access.
3. Run polish validation and finalize documentation.

### Parallel Team Strategy

1. Split foundational utility work (`T004`, `T005`) across contributors.
2. Merge and complete shared server middleware integration (`T006`, `T007`).
3. Run US1 and US2 sequentially where shared files overlap.

---

## Notes

- Each task follows the strict checklist format with ID and file path.
- User stories are independently testable based on acceptance scenarios.
- Credentials remain runtime-managed and are never committed as plaintext secrets.
