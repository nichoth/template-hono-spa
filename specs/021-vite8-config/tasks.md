# Tasks: Vite 8 Config Compatibility

**Input**: Design documents from `/specs/021-vite8-config/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No separate test-first phase was requested, but this feature includes regression-validation tasks because preserving start/build behavior is part of the feature contract.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the current compatibility surface and align the feature docs with the repo entry points before changing configuration.

- [X] T001 Capture the current Vite-facing workflow entry points in /Users/nick/code/template-hono-spa/package.json
- [X] T002 Capture the current configuration surface and integration seams in /Users/nick/code/template-hono-spa/vite.config.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared compatibility baseline that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Confirm build-artifact expectations remain aligned with /Users/nick/code/template-hono-spa/src/server/startup-assets.ts
- [X] T004 [P] Confirm dev/build validation seams remain aligned with /Users/nick/code/template-hono-spa/test/integration.spec.ts and /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [X] T005 Document the accepted Vite 8 compatibility boundary in /Users/nick/code/template-hono-spa/specs/021-vite8-config/contracts/vite8-config-contract.md

**Checkpoint**: Foundation ready; local-dev and build-compatibility work can proceed.

---

## Phase 3: User Story 1 - Keep Local Development Working After Upgrade (Priority: P1) 🎯 MVP

**Goal**: Make the repository start cleanly on Vite 8 without configuration-related startup failures.

**Independent Test**: Run `npm start` and confirm the app shell starts without configuration errors and serves existing routes.

- [X] T006 [US1] Update Vite 8 development-mode compatibility settings in /Users/nick/code/template-hono-spa/vite.config.js
- [X] T007 [US1] Align any dev-server-facing workflow assumptions in /Users/nick/code/template-hono-spa/package.json
- [X] T008 [US1] Add or update local-start compatibility regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T009 [US1] Document manual local-start validation for the Vite 8 path in /Users/nick/code/template-hono-spa/specs/021-vite8-config/quickstart.md

**Checkpoint**: User Story 1 is complete when local development starts cleanly and the app shell remains reachable.

---

## Phase 4: User Story 2 - Preserve Build and Deployment Behavior (Priority: P2)

**Goal**: Keep production build output and runtime asset expectations intact after the Vite 8 config adjustment.

**Independent Test**: Run `npm run build` and confirm the build completes and the generated asset/manifest flow still matches runtime expectations.

- [X] T010 [P] [US2] Update Vite 8 build-mode compatibility settings in /Users/nick/code/template-hono-spa/vite.config.js
- [X] T011 [P] [US2] Adjust build-script expectations if needed in /Users/nick/code/template-hono-spa/package.json
- [X] T012 [US2] Add or update build-output compatibility regression coverage in /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [X] T013 [US2] Reconcile Vite 8 build output assumptions against /Users/nick/code/template-hono-spa/src/server/startup-assets.ts

**Checkpoint**: User Story 2 is complete when production build output remains usable by the current runtime flow.

---

## Phase 5: User Story 3 - Make Upgrade Intent Clear For Future Changes (Priority: P3)

**Goal**: Make the Vite 8 compatibility-sensitive configuration understandable and maintainable.

**Independent Test**: A contributor can review the updated config and feature docs and identify the compatibility-sensitive settings quickly.

- [X] T014 [P] [US3] Clarify Vite 8 compatibility intent directly in /Users/nick/code/template-hono-spa/vite.config.js
- [X] T015 [P] [US3] Record compatibility decisions and reviewer guidance in /Users/nick/code/template-hono-spa/specs/021-vite8-config/research.md
- [X] T016 [US3] Align contributor-facing validation steps and notes in /Users/nick/code/template-hono-spa/specs/021-vite8-config/quickstart.md

**Checkpoint**: User Story 3 is complete when the updated config and docs make the compatibility boundary obvious.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and task completion across all stories

- [ ] T017 Run lint and full test validation for the feature using /Users/nick/code/template-hono-spa/package.json commands
- [X] T018 Run production build validation for the feature using /Users/nick/code/template-hono-spa/package.json commands
- [ ] T019 Mark completed feature tasks and final validation notes in /Users/nick/code/template-hono-spa/specs/021-vite8-config/tasks.md and /Users/nick/code/template-hono-spa/specs/021-vite8-config/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion; establishes the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow the confirmed Vite 8 dev-compatibility baseline from US1.
- **User Story 3 (Phase 5)**: Depends on the finalized configuration direction from US1 and US2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other user stories.
- **User Story 2 (P2)**: Shares the same config surface as US1 and should build on the finalized compatibility shape.
- **User Story 3 (P3)**: Depends on the final chosen compatibility settings from US1 and US2.

### Parallel Opportunities

- `T003` and `T004` can run in parallel after setup.
- `T010` and `T011` can run in parallel once US1 is complete.
- `T014` and `T015` can run in parallel after US1 and US2 settle the final config shape.

---

## Parallel Example: User Story 2

```bash
Task: "Update Vite 8 build-mode compatibility settings in /Users/nick/code/template-hono-spa/vite.config.js"
Task: "Adjust build-script expectations if needed in /Users/nick/code/template-hono-spa/package.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `npm start` behavior before moving on

### Incremental Delivery

1. Establish the compatibility boundary and validation seams
2. Restore clean Vite 8 local startup
3. Preserve production build and runtime asset compatibility
4. Document the final compatibility-sensitive config decisions

### Parallel Team Strategy

1. One contributor confirms startup/build validation seams in Phase 2
2. One contributor handles config/script updates once Phase 3 or Phase 4 opens
3. One contributor updates docs and regression coverage after the config shape stabilizes
