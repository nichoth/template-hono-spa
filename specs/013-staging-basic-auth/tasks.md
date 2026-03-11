# Tasks: Staging Site Password Protection

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/`
**Prerequisites**: `/Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/plan.md`, `/Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/spec.md`, `/Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/research.md`, `/Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/data-model.md`, `/Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/contracts/access-control-contract.md`

**Tests**: Include request-level integration tests because the plan and research explicitly call for regression coverage around staging, production, and localhost behavior.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after the foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing test and configuration surface for the staging-only access-control change.

- [ ] T001 Review and update feature quickstart expectations in /Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/quickstart.md
- [ ] T002 Confirm staging secret names and branch metadata usage in /Users/nick/code/template-hono-spa/wrangler.jsonc and /Users/nick/code/template-hono-spa/wrangler.test.jsonc

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared environment-classification behavior that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Update environment classification rules in /Users/nick/code/template-hono-spa/src/server/deployment-context.ts to distinguish staging-only protection from production and localhost/public behavior
- [ ] T004 Add or adjust unit coverage for deployment-context classification in /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [ ] T005 Verify Worker request gating consumes the revised deployment context contract in /Users/nick/code/template-hono-spa/src/server/index.ts

**Checkpoint**: Environment classification is stable and user-story behavior can be validated on top of it.

---

## Phase 3: User Story 1 - Restrict staging access (Priority: P1) 🎯 MVP

**Goal**: Ensure the staging deployment consistently requires valid basic-auth credentials before serving protected content.

**Independent Test**: Send staging requests without credentials, with malformed credentials, and with valid credentials; confirm only valid credentials allow the request through.

### Tests for User Story 1

- [ ] T006 [US1] Add staging unauthorized and malformed-credential integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [ ] T007 [US1] Add staging valid-credential integration coverage for HTML and API access in /Users/nick/code/template-hono-spa/test/integration.spec.ts

### Implementation for User Story 1

- [ ] T008 [US1] Update staging-only auth gate behavior in /Users/nick/code/template-hono-spa/src/server/index.ts
- [ ] T009 [US1] Refine credential parsing and matching behavior for protected staging requests in /Users/nick/code/template-hono-spa/src/server/basic-auth.ts
- [ ] T010 [US1] Verify unauthorized staging challenge response semantics in /Users/nick/code/template-hono-spa/src/server/access-response.ts

**Checkpoint**: Staging requests are protected and independently testable without relying on production or localhost scenarios.

---

## Phase 4: User Story 2 - Keep production public (Priority: P2)

**Goal**: Preserve public access for the production deployment while staging remains protected.

**Independent Test**: Send production requests without credentials and confirm both app-shell and API responses succeed without any auth challenge.

### Tests for User Story 2

- [ ] T011 [US2] Add production public-access regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts

### Implementation for User Story 2

- [ ] T012 [US2] Update production branch configuration expectations in /Users/nick/code/template-hono-spa/wrangler.jsonc
- [ ] T013 [US2] Align production request-path behavior with the staging-only contract in /Users/nick/code/template-hono-spa/src/server/index.ts

**Checkpoint**: Production remains publicly accessible even when staging protection is enabled.

---

## Phase 5: User Story 3 - Keep local development unblocked (Priority: P3)

**Goal**: Preserve frictionless localhost access for developers while keeping staging protected.

**Independent Test**: Run the app locally or issue localhost test requests without credentials and confirm the app shell and API remain accessible without a prompt.

### Tests for User Story 3

- [ ] T014 [US3] Add localhost open-access regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts

### Implementation for User Story 3

- [ ] T015 [US3] Adjust local-development request handling to stay public in /Users/nick/code/template-hono-spa/src/server/index.ts
- [ ] T016 [US3] Remove or update local debug assumptions tied to staging behavior in /Users/nick/code/template-hono-spa/src/client/index.ts

**Checkpoint**: Local development remains open and independently testable alongside staging protection.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation alignment, and cleanup across all stories.

- [ ] T017 [P] Update the access-control contract details in /Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/contracts/access-control-contract.md
- [ ] T018 [P] Update implementation notes and manual verification steps in /Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/quickstart.md
- [ ] T019 Run full verification commands from /Users/nick/code/template-hono-spa/specs/013-staging-basic-auth/quickstart.md using /Users/nick/code/template-hono-spa/package.json scripts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should be validated after US1 because it confirms the narrowed scope did not regress production access.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and should be validated after US1 because it confirms the narrowed scope did not regress localhost access.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1**: Starts after Foundational; no dependency on other user stories; this is the MVP.
- **US2**: Starts after Foundational; behavior is independently testable but shares the narrowed environment-classification logic established for US1.
- **US3**: Starts after Foundational; behavior is independently testable but shares the narrowed environment-classification logic established for US1.

### Within Each User Story

- Test tasks should be written first and observed failing before implementation.
- Request-handling behavior should be updated before documentation polish.
- Story-specific verification should complete before moving to the next priority if delivering incrementally.

### Parallel Opportunities

- T001 and T002 can proceed independently.
- T006 and T007 both target the same file, so they should be executed sequentially despite covering separate scenarios.
- T017 and T018 can run in parallel because they update different documentation files.
- After Phase 2, US2 and US3 can be assigned in parallel to different developers once US1 establishes the staging-only contract.

---

## Parallel Example: User Story 1

```bash
# Sequential in one file for test safety:
Task: "Add staging unauthorized and malformed-credential integration coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
Task: "Add staging valid-credential integration coverage for HTML and API access in /Users/nick/code/template-hono-spa/test/integration.spec.ts"

# Implementation sequence:
Task: "Update staging-only auth gate behavior in /Users/nick/code/template-hono-spa/src/server/index.ts"
Task: "Refine credential parsing and matching behavior for protected staging requests in /Users/nick/code/template-hono-spa/src/server/basic-auth.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add production public-access regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
Task: "Update production branch configuration expectations in /Users/nick/code/template-hono-spa/wrangler.jsonc"
```

## Parallel Example: User Story 3

```bash
Task: "Add localhost open-access regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
Task: "Remove or update local debug assumptions tied to staging behavior in /Users/nick/code/template-hono-spa/src/client/index.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3.
4. Validate staging challenge and valid-credential access independently.
5. Stop there if only the staging protection MVP is needed.

### Incremental Delivery

1. Complete Setup and Foundational work.
2. Deliver US1 and validate staging-only protection.
3. Deliver US2 and validate production remains public.
4. Deliver US3 and validate localhost remains public.
5. Finish with Phase 6 documentation and full verification.

### Parallel Team Strategy

1. One developer completes Setup and Foundational work.
2. After US1 establishes the staging-only contract:
   - Developer A can handle production regression work in /Users/nick/code/template-hono-spa/wrangler.jsonc and /Users/nick/code/template-hono-spa/src/server/index.ts
   - Developer B can handle localhost regression work in /Users/nick/code/template-hono-spa/src/client/index.ts and related validation
3. Rejoin for final verification and documentation updates.

## Notes

- All tasks follow the required checklist format with IDs and exact file paths.
- `[P]` is used only where the task can be worked independently without same-file conflicts.
- The MVP scope is US1 after Phase 1 and Phase 2 complete.
- Each story has an independent test definition that can be executed without completing lower-priority stories.
