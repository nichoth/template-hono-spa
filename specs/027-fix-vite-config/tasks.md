# Tasks: Vite Dependency Optimization Warning Fix

**Input**: Design documents from `/specs/027-fix-vite-config/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/vite-optimize-deps-contract.md, quickstart.md

**Tests**: No new test-first tasks are required by the specification. Verification tasks are included where they directly prove the workflow contract.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture the current warning source and align the implementation surface with the repository plan.

- [X] T001 Inspect current startup/config surfaces in /Users/nick/code/template-hono-spa/vite.config.js and /Users/nick/code/template-hono-spa/package.json
- [X] T002 [P] Inspect existing startup regression coverage opportunities in /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T003 Record the warning reproduction path and affected config seam in /Users/nick/code/template-hono-spa/specs/027-fix-vite-config/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared implementation and validation boundary before story-specific changes.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Confirm the effective dependency-optimization source and supported replacement path in /Users/nick/code/template-hono-spa/vite.config.js
- [X] T005 [P] Define repository-level regression assertions for the warning-removal contract in /Users/nick/code/template-hono-spa/specs/027-fix-vite-config/contracts/vite-optimize-deps-contract.md
- [X] T006 [P] Prepare focused verification coverage targets in /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts

**Checkpoint**: Warning source and validation boundary are defined.

---

## Phase 3: User Story 1 - Start Development Without Deprecation Noise (Priority: P1) 🎯 MVP

**Goal**: Remove the reported dependency-optimization deprecation warning from `npm start`.

**Independent Test**: Run `npm start` and confirm startup completes without the `optimizeDeps.esbuildOptions` deprecation warning while the app still boots.

- [X] T007 [US1] Update dependency-optimization handling in /Users/nick/code/template-hono-spa/vite.config.js to use the supported configuration path for local startup
- [X] T008 [US1] Add regression assertions for deprecated-vs-supported dependency-optimization config in /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [X] T009 [US1] Verify the `npm start` warning-removal contract against /Users/nick/code/template-hono-spa/vite.config.js and /Users/nick/code/template-hono-spa/package.json

**Checkpoint**: `npm start` no longer surfaces the reported warning.

---

## Phase 4: User Story 2 - Preserve Existing Local Workflow Behavior (Priority: P2)

**Goal**: Keep the current dev-server startup workflow, route delivery, and asset delivery intact after the warning fix.

**Independent Test**: Start the local server and confirm expected routes and assets remain available through the same command.

- [X] T010 [US2] Preserve existing startup command behavior in /Users/nick/code/template-hono-spa/package.json and /Users/nick/code/template-hono-spa/vite.config.js
- [X] T011 [US2] Add workflow-preservation regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T012 [US2] Update local verification steps for route and asset checks in /Users/nick/code/template-hono-spa/specs/027-fix-vite-config/quickstart.md

**Checkpoint**: Startup behavior remains unchanged apart from warning removal.

---

## Phase 5: User Story 3 - Keep Configuration Intent Maintainable (Priority: P3)

**Goal**: Make the supported dependency-optimization approach clear enough to avoid regressions during future config edits.

**Independent Test**: Review the updated config and docs and confirm the supported optimization path and its reason are easy to identify.

- [X] T013 [US3] Clarify maintainable dependency-optimization intent in /Users/nick/code/template-hono-spa/vite.config.js
- [X] T014 [US3] Align the feature contract with the final supported config approach in /Users/nick/code/template-hono-spa/specs/027-fix-vite-config/contracts/vite-optimize-deps-contract.md
- [X] T015 [US3] Document future-maintainer guidance for this warning class in /Users/nick/code/template-hono-spa/specs/027-fix-vite-config/research.md

**Checkpoint**: The supported config approach is explicit in code and feature docs.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all stories.

- [X] T016 [P] Run lint and test validation for the completed fix via /Users/nick/code/template-hono-spa/package.json
- [X] T017 Run end-to-end quickstart validation and finalize task tracking in /Users/nick/code/template-hono-spa/specs/027-fix-vite-config/quickstart.md and /Users/nick/code/template-hono-spa/specs/027-fix-vite-config/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; start immediately.
- **Phase 2: Foundational**: Depends on Phase 1; blocks all user story work.
- **Phase 3: US1**: Depends on Phase 2; establishes the MVP by removing the warning.
- **Phase 4: US2**: Depends on US1 because workflow-preservation verification assumes the warning fix is already in place.
- **Phase 5: US3**: Depends on US1 and US2 so documentation reflects the final implemented behavior.
- **Phase 6: Polish**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on other user stories.
- **US2 (P2)**: Starts after US1; validates preserved workflow around the implemented warning fix.
- **US3 (P3)**: Starts after US1 and US2; documents the final supported configuration approach.

### Parallel Opportunities

- `T002` can run in parallel with `T001` because it inspects test coverage while setup review inspects config and scripts.
- `T005` and `T006` can run in parallel once `T004` identifies the effective config seam.
- `T016` is parallelizable across lint/test commands because it targets independent validation surfaces.

---

## Parallel Example: User Story 1

```bash
Task: "Update dependency-optimization handling in /Users/nick/code/template-hono-spa/vite.config.js to use the supported configuration path for local startup"
Task: "Add regression assertions for deprecated-vs-supported dependency-optimization config in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Preserve existing startup command behavior in /Users/nick/code/template-hono-spa/package.json and /Users/nick/code/template-hono-spa/vite.config.js"
Task: "Add workflow-preservation regression coverage in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

## Parallel Example: Foundational Phase

```bash
Task: "Define repository-level regression assertions for the warning-removal contract in /Users/nick/code/template-hono-spa/specs/027-fix-vite-config/contracts/vite-optimize-deps-contract.md"
Task: "Prepare focused verification coverage targets in /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 to remove the startup warning.
3. Validate `npm start` independently before expanding scope.

### Incremental Delivery

1. Remove the warning first.
2. Validate preserved route/asset behavior next.
3. Document the final supported config approach last.

### Parallel Team Strategy

1. One contributor confirms the active config seam while another prepares regression coverage targets.
2. After US1 lands, one contributor can verify workflow behavior while another updates maintainability docs.

---

## Notes

- All tasks follow the required checklist format with explicit file paths.
- User-story tasks are independently testable and map directly to the three spec priorities.
- The task list stays intentionally narrow because the feature scope is a small config-compatibility fix, not a broader Vite migration.
