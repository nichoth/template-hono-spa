# Tasks: Reliable Local Dev Startup

**Input**: Design documents from `/specs/001-fix-npm-start/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the feature specification defines explicit acceptance scenarios and independent test criteria for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align implementation files and verification baseline for startup reliability work.

- [X] T001 Review and refresh feature planning context in /Users/nick/code/template-hono-spa/specs/001-fix-npm-start/plan.md
- [X] T002 Capture current startup failure baseline and reproduction notes in /Users/nick/code/template-hono-spa/specs/001-fix-npm-start/research.md
- [X] T003 [P] Add startup verification instructions for contributors in /Users/nick/code/template-hono-spa/specs/001-fix-npm-start/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare shared runtime/test scaffolding required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add shared startup artifact handling utility in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts
- [X] T005 [P] Add shared startup error messaging utility in /Users/nick/code/template-hono-spa/src/server/startup-errors.ts
- [X] T006 [P] Add focused unit tests for startup utilities in /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [X] T007 Wire shared startup utilities into server entrypoint in /Users/nick/code/template-hono-spa/src/server/index.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Start Development Quickly (Priority: P1) 🎯 MVP

**Goal**: Ensure `npm start` works from a clean checkout and serves a valid local response.

**Independent Test**: Remove generated client artifacts, run `npm start`, and verify local app URL returns valid HTML without startup crash.

### Tests for User Story 1

- [X] T008 [P] [US1] Add integration test coverage for clean-start startup success in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T009 [P] [US1] Add unit test coverage for production-only manifest resolution behavior in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 1

- [X] T010 [US1] Remove hard startup dependency on built manifest import in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T011 [US1] Implement dev-safe asset path resolution fallback in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts
- [X] T012 [US1] Ensure SSR route handling uses dev-safe asset resolution in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T013 [US1] Update local development startup documentation for clean-checkout behavior in /Users/nick/code/template-hono-spa/README.md

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Recover Cleanly From Missing Generated Assets (Priority: P2)

**Goal**: Missing generated assets no longer cause unhandled startup failure.

**Independent Test**: Delete generated client artifacts, run `npm start`, and verify startup recovers without manual pre-build steps.

### Tests for User Story 2

- [X] T014 [P] [US2] Add integration scenario for startup with intentionally missing client artifact files in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T015 [P] [US2] Add unit tests for missing-artifact recovery path in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 2

- [X] T016 [US2] Implement missing-artifact detection and non-fatal recovery flow in /Users/nick/code/template-hono-spa/src/server/startup-assets.ts
- [X] T017 [US2] Integrate startup artifact recovery flow into server bootstrap path in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T018 [US2] Align npm script behavior with recovery expectations in /Users/nick/code/template-hono-spa/package.json
- [X] T019 [US2] Document missing-artifact recovery expectations in /Users/nick/code/template-hono-spa/specs/001-fix-npm-start/contracts/dev-startup-contract.md

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Actionable Startup Failures (Priority: P3)

**Goal**: Unrecoverable startup failures provide clear cause and concrete remediation.

**Independent Test**: Trigger an unrecoverable startup prerequisite failure and verify the output includes explicit cause plus actionable next step.

### Tests for User Story 3

- [X] T020 [P] [US3] Add integration coverage for actionable startup failure output in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T021 [P] [US3] Add unit tests for startup error message formatting in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 3

- [X] T022 [US3] Implement standardized startup failure message format in /Users/nick/code/template-hono-spa/src/server/startup-errors.ts
- [X] T023 [US3] Apply standardized startup failure messaging in server startup flow in /Users/nick/code/template-hono-spa/src/server/index.tsx
- [X] T024 [US3] Update quickstart failure-validation steps for actionable diagnostics in /Users/nick/code/template-hono-spa/specs/001-fix-npm-start/quickstart.md

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency and verification across all user stories.

- [X] T025 [P] Reconcile startup behavior narrative across docs in /Users/nick/code/template-hono-spa/README.md
- [X] T026 [P] Verify feature artifacts stay aligned in /Users/nick/code/template-hono-spa/specs/001-fix-npm-start/plan.md
- [X] T027 Run full regression verification commands and record outcomes in /Users/nick/code/template-hono-spa/specs/001-fix-npm-start/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2; defines MVP.
- **Phase 4 (US2)**: Depends on Phase 2 and can proceed after US1 if shared files are coordinated.
- **Phase 5 (US3)**: Depends on Phase 2 and should follow US2 for coherent startup error/recovery behavior.
- **Phase 6 (Polish)**: Depends on all completed user story phases.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational phase.
- **US2 (P2)**: Independent after Foundational, but benefits from US1 startup path stabilization.
- **US3 (P3)**: Independent after Foundational, but should build on US2 recovery/failure branching for consistency.

### Dependency Graph

- Foundational -> US1 -> US2 -> US3 -> Polish

---

## Parallel Execution Examples

### User Story 1

```bash
Task T008: Add integration test coverage for clean-start startup success in /Users/nick/code/template-hono-spa/test/integration.spec.ts
Task T009: Add unit test coverage for production-only manifest resolution behavior in /Users/nick/code/template-hono-spa/test/unit.spec.ts
```

### User Story 2

```bash
Task T014: Add integration scenario for startup with intentionally missing client artifact files in /Users/nick/code/template-hono-spa/test/integration.spec.ts
Task T015: Add unit tests for missing-artifact recovery path in /Users/nick/code/template-hono-spa/test/unit.spec.ts
```

### User Story 3

```bash
Task T020: Add integration coverage for actionable startup failure output in /Users/nick/code/template-hono-spa/test/integration.spec.ts
Task T021: Add unit tests for startup error message formatting in /Users/nick/code/template-hono-spa/test/unit.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently via clean-start scenario.
4. Ship/demo MVP once `npm start` reliability is confirmed.

### Incremental Delivery

1. Deliver US1 for baseline startup reliability.
2. Deliver US2 for missing-artifact recovery behavior.
3. Deliver US3 for actionable failure messaging.
4. Run Phase 6 polish and regression checks.

### Parallel Team Strategy

1. One developer handles shared foundational runtime plumbing (T004, T007).
2. One developer prepares test scaffolding tasks marked [P].
3. After foundation, assign US2 and US3 in parallel with merge coordination on `src/server/index.tsx`.

---

## Notes

- All tasks follow required checklist format: `- [X] T### [P?] [US?] Description with file path`.
- Story labels are used only for user story phases (US1-US3).
- Each user story contains explicit independent test criteria.
