# Tasks: Adaptive Layout Without Media Queries

**Input**: Design documents from `/specs/011-remove-media-queries/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No new automated tests were explicitly requested in the feature specification; this task list uses lint/test execution and manual viewport validation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Every task includes exact file path(s)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare documentation and execution baseline for adaptive-layout work.

- [X] T001 Add a viewport/zoom validation checklist section for this feature in /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/quickstart.md
- [X] T002 Capture breakpoint-removal scope and target files in /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/research.md
- [X] T003 [P] Confirm implementation touchpoints match plan structure in /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared fluid layout tokens and base constraints used by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Define and normalize shared fluid layout tokens for adaptive spacing and track sizing in /Users/nick/code/template-hono-spa/src/style.css
- [X] T005 Establish base shell constraints for readable width and overflow safety in /Users/nick/code/template-hono-spa/src/style.css

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Readable On Any Screen (Priority: P1) 🎯 MVP

**Goal**: Ensure primary pages reflow cleanly across narrow and wide viewports with no horizontal scrolling.

**Independent Test**: Open primary routes at 320/480/768/1024/1440/1920 widths and confirm readable content and no horizontal page overflow.

### Implementation for User Story 1

- [X] T006 [P] [US1] Replace breakpoint-based card columns with intrinsic grid tracks in /Users/nick/code/template-hono-spa/src/client/routes/home.css
- [X] T007 [P] [US1] Tune shared container spacing and max-width behavior for small and large screens in /Users/nick/code/template-hono-spa/src/style.css
- [X] T008 [US1] Align card block sizing to intrinsic grid behavior and prevent card overflow in /Users/nick/code/template-hono-spa/src/client/components/card.css
- [X] T009 [US1] Remove legacy home-route media-query blocks and align gap usage to fluid tokens in /Users/nick/code/template-hono-spa/src/client/routes/home.css
- [X] T010 [US1] Record US1 viewport validation results in /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/quickstart.md

**Checkpoint**: User Story 1 is independently functional and demonstrable.

---

## Phase 4: User Story 2 - Predictable Single Layout System (Priority: P2)

**Goal**: Maintain one intrinsic layout system with no breakpoint-specific behavior.

**Independent Test**: Continuously resize viewport and verify smooth intrinsic reflow without abrupt breakpoint-driven layout mode changes.

### Implementation for User Story 2

- [X] T011 [P] [US2] Refactor navigation layout to intrinsic wrapping/alignment without breakpoint rules in /Users/nick/code/template-hono-spa/src/client/components/nav.css
- [X] T012 [P] [US2] Consolidate adaptive layout token usage to one consistent system in /Users/nick/code/template-hono-spa/src/style.css
- [X] T013 [US2] Remove any remaining `@media` blocks from /Users/nick/code/template-hono-spa/src/style.css, /Users/nick/code/template-hono-spa/src/client/routes/home.css, and /Users/nick/code/template-hono-spa/src/client/components/nav.css
- [X] T014 [US2] Add no-media-query compliance command and expected result notes in /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/quickstart.md
- [X] T015 [US2] Record continuous-resize behavior observations in /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/quickstart.md

**Checkpoint**: User Stories 1 and 2 both work independently with a single intrinsic layout system.

---

## Phase 5: User Story 3 - Stable Under Real Content (Priority: P3)

**Goal**: Keep layout stable under long headings, long unbroken strings, and zoom/orientation stress.

**Independent Test**: Populate long-content scenarios and verify no clipping/overlap and maintained action visibility, including at 200% zoom.

### Implementation for User Story 3

- [X] T016 [P] [US3] Add long-content wrapping and overflow safeguards for card content in /Users/nick/code/template-hono-spa/src/client/components/card.css
- [X] T017 [P] [US3] Add long-label and zoom resilience safeguards for nav links/actions in /Users/nick/code/template-hono-spa/src/client/components/nav.css
- [X] T018 [US3] Add home-route grid/item safeguards for long-content rendering stability in /Users/nick/code/template-hono-spa/src/client/routes/home.css
- [X] T019 [US3] Record long-content and 200%-zoom validation outcomes in /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/quickstart.md

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and completion checks across all stories.

- [X] T020 [P] Run lint verification for updated layout files in /Users/nick/code/template-hono-spa/src/style.css, /Users/nick/code/template-hono-spa/src/client/routes/home.css, /Users/nick/code/template-hono-spa/src/client/components/nav.css, and /Users/nick/code/template-hono-spa/src/client/components/card.css
- [X] T021 [P] Run regression tests covering app behavior in /Users/nick/code/template-hono-spa/test/integration.spec.ts and /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [X] T022 Finalize feature documentation consistency in /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/spec.md and /Users/nick/code/template-hono-spa/specs/011-remove-media-queries/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2 completion; can run after MVP validation of US1.
- **Phase 5 (US3)**: Depends on Phase 2 completion; recommended after US1 due to shared CSS areas.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational work.
- **US2 (P2)**: No hard dependency on US1, but should preserve US1 behavior in shared files.
- **US3 (P3)**: No hard dependency on US2, but should preserve US1/US2 behavior in shared files.

### Dependency Graph

- Setup -> Foundational -> US1 (MVP)
- Foundational -> US2
- Foundational -> US3
- US1 + US2 + US3 -> Polish

---

## Parallel Execution Examples

### User Story 1

- Run `T006` and `T007` in parallel (different files: `home.css` vs `style.css`).
- Start `T008` after `T006` to align card behavior with updated grid tracks.

### User Story 2

- Run `T011` and `T012` in parallel (`nav.css` vs `style.css`).
- Execute `T013` after `T011/T012` to perform final media-query removal sweep.

### User Story 3

- Run `T016` and `T017` in parallel (`card.css` vs `nav.css`).
- Execute `T018` after `T016` to verify route-level grid stability with long content.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently across viewport matrix.
4. Ship/demo MVP.

### Incremental Delivery

1. Deliver US1 (MVP).
2. Deliver US2 (single-system maintainability).
3. Deliver US3 (stress-case stability).
4. Complete Phase 6 polish and validation.

### Parallel Team Strategy

1. One developer handles shared tokens/foundation (Phase 1-2).
2. After foundation, developers split US2 and US3 while US1 is stabilized.
3. Rejoin for Phase 6 verification and documentation closure.

---

## Notes

- Tasks marked `[P]` are parallelizable based on file independence.
- Story-labeled tasks (`[US1]`, `[US2]`, `[US3]`) are isolated for independent testing and delivery.
- All tasks use absolute file paths as required.
