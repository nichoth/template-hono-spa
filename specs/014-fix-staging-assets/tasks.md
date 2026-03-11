# Tasks: Staging Asset Loading Reliability

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/`
**Prerequisites**: `/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/plan.md`, `/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/spec.md`, `/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/research.md`, `/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/data-model.md`, `/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/contracts/asset-loading-contract.md`

**Tests**: Include tests because the plan and research explicitly call for unit and request-level regression coverage around asset resolution.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after the foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the build, runtime, and documentation context for the staging asset-path fix.

- [ ] T001 Review current staging asset expectations and manual verification steps in /Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/quickstart.md
- [ ] T002 Confirm build output and deploy metadata assumptions in /Users/nick/code/template-hono-spa/package.json, /Users/nick/code/template-hono-spa/wrangler.jsonc, and /Users/nick/code/template-hono-spa/src/server/startup-assets.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared asset-resolution behavior used by every user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Add or update startup asset resolver unit coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts for valid manifest, missing manifest, and fallback path behavior
- [ ] T004 Update deploy-path fallback rules in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts so non-dev asset references remain deploy-valid
- [ ] T005 Align shell asset insertion with the shared resolver output in /Users/nick/code/template-hono-spa/src/server/index.ts

**Checkpoint**: Resolver and shell path selection are stable enough for story-specific verification.

---

## Phase 3: User Story 1 - Load staging assets successfully (Priority: P1) 🎯 MVP

**Goal**: Ensure staging shell responses reference CSS and JavaScript assets that actually exist and load successfully.

**Independent Test**: Generate a staging-like shell response and verify the emitted CSS and JavaScript URLs no longer 404 in the deploy-style path model.

### Tests for User Story 1

- [ ] T006 [US1] Add request-level staging shell asset regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [ ] T007 [US1] Add resolver-level staging fallback regression coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 1

- [ ] T008 [US1] Update staging asset recovery behavior in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts
- [ ] T009 [US1] Ensure shell HTML uses the corrected asset paths in /Users/nick/code/template-hono-spa/src/server/index.ts

**Checkpoint**: Staging asset URLs are independently testable and no longer depend on broken fallback names.

---

## Phase 4: User Story 2 - Preserve working local and non-staging behavior (Priority: P2)

**Goal**: Keep local and other working environments loading assets successfully after the staging fix.

**Independent Test**: Run local and non-staging shell scenarios and confirm valid asset URLs are still emitted for those environments.

### Tests for User Story 2

- [ ] T010 [US2] Add local and non-staging asset regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts

### Implementation for User Story 2

- [ ] T011 [US2] Preserve development asset selection behavior in /Users/nick/code/template-hono-spa/src/server/index.ts
- [ ] T012 [US2] Preserve non-staging resolver behavior in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts

**Checkpoint**: The staging fix does not regress environments that already worked.

---

## Phase 5: User Story 3 - Make asset-resolution failures diagnosable (Priority: P3)

**Goal**: Make broken or missing asset metadata obvious to maintainers instead of silently returning broken shell references.

**Independent Test**: Simulate invalid or incomplete asset metadata and confirm the system emits a clear diagnostic signal rather than silently pointing at broken deploy URLs.

### Tests for User Story 3

- [ ] T013 [US3] Add invalid-manifest and incomplete-metadata diagnostics coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 3

- [ ] T014 [US3] Improve asset-resolution diagnostics in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts
- [ ] T015 [US3] Ensure startup failure messaging remains actionable in /Users/nick/code/template-hono-spa/src/server/startup-errors.ts and /Users/nick/code/template-hono-spa/src/server/index.ts

**Checkpoint**: Asset-resolution failures are independently diagnosable without relying on browser-side 404s alone.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation alignment and full verification across all stories.

- [ ] T016 [P] Update the shell asset loading contract in /Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/contracts/asset-loading-contract.md
- [ ] T017 [P] Update manual verification and completion notes in /Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/quickstart.md
- [ ] T018 Run full verification commands from /Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/quickstart.md using /Users/nick/code/template-hono-spa/package.json scripts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should be validated after US1 because it confirms the fix did not regress working environments.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and can proceed after US1 because it hardens the failure path around the same resolver logic.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1**: Starts after Foundational; no dependency on other stories; this is the MVP.
- **US2**: Starts after Foundational; independently testable but shares the resolver foundation established for US1.
- **US3**: Starts after Foundational; independently testable but shares the resolver foundation established for US1.

### Within Each User Story

- Test tasks should be written first and observed failing before implementation.
- Resolver behavior should be updated before shell or documentation cleanup.
- Story verification should complete before moving to the next priority if delivering incrementally.

### Parallel Opportunities

- T001 and T002 can be worked independently.
- T016 and T017 can run in parallel because they touch different documentation files.
- After Phase 2, US2 and US3 can be assigned in parallel to different developers once US1 has established the corrected staging resolver behavior.

---

## Parallel Example: User Story 1

```bash
# Sequential in shared test and resolver files:
Task: "Add request-level staging shell asset regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
Task: "Add resolver-level staging fallback regression coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts"

# Implementation sequence:
Task: "Update staging asset recovery behavior in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts"
Task: "Ensure shell HTML uses the corrected asset paths in /Users/nick/code/template-hono-spa/src/server/index.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add local and non-staging asset regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
Task: "Preserve development asset selection behavior in /Users/nick/code/template-hono-spa/src/server/index.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Add invalid-manifest and incomplete-metadata diagnostics coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Improve asset-resolution diagnostics in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3.
4. Validate staging shell asset URLs independently.
5. Stop there if the immediate staging 404 issue is the only required delivery.

### Incremental Delivery

1. Complete Setup and Foundational work.
2. Deliver US1 and validate staging asset loading.
3. Deliver US2 and validate local/non-staging behavior remains intact.
4. Deliver US3 and validate diagnostic behavior for manifest failures.
5. Finish with Phase 6 documentation and full verification.

### Parallel Team Strategy

1. One developer completes Setup and Foundational work.
2. After US1 is in place:
   - Developer A can handle non-staging preservation work in /Users/nick/code/template-hono-spa/src/server/index.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts
   - Developer B can handle diagnostics hardening in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts and /Users/nick/code/template-hono-spa/test/unit.spec.ts
3. Rejoin for final verification and doc updates.

## Notes

- All tasks follow the required checklist format with IDs and exact file paths.
- `[P]` is used only where tasks can proceed without same-file conflicts.
- The MVP scope is US1 after Phase 1 and Phase 2 complete.
- Each story has an independent test definition that can be validated without completing lower-priority stories.
