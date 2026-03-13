# Tasks: Shared Color Variables

**Input**: Design documents from `/specs/016-css-color-vars/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include focused regression coverage because the plan requires an automated check that maintained styles do not reintroduce direct color literals.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the exact implementation surface and validation targets before editing styles

- [X] T001 Review the semantic token contract in /Users/nick/code/template-hono-spa/specs/016-css-color-vars/contracts/color-token-contract.md and current root token definitions in /Users/nick/code/template-hono-spa/src/style.css
- [X] T002 [P] Inventory remaining direct color usage in /Users/nick/code/template-hono-spa/src/style.css, /Users/nick/code/template-hono-spa/src/client/components/nav.css, and /Users/nick/code/template-hono-spa/src/client/routes/login.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared semantic token set that every story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Expand the shared `:root` color token set in /Users/nick/code/template-hono-spa/src/style.css to cover base text, inverse text, surfaces, borders, focus, and error usage without relying on direct literals
- [X] T004 Remove or alias any redundant pigment-based root tokens in /Users/nick/code/template-hono-spa/src/style.css so each semantic purpose has one authoritative shared source

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Keep Color Styling Consistent (Priority: P1) 🎯 MVP

**Goal**: Make visitor-facing colors render consistently across the main layout, navigation, and route feedback states

**Independent Test**: Load `/`, `/about`, and `/login`; confirm shared surfaces, inverse navigation states, and error feedback use the same semantic colors without one-off literal values in the maintained stylesheets

- [X] T005 [P] [US1] Replace direct title, avatar, link, and outline color literals in /Users/nick/code/template-hono-spa/src/style.css with shared semantic tokens
- [X] T006 [P] [US1] Replace mobile navigation overlay, button, link, and icon color literals in /Users/nick/code/template-hono-spa/src/client/components/nav.css with shared inverse/surface tokens
- [X] T007 [US1] Replace the login validation error literal in /Users/nick/code/template-hono-spa/src/client/routes/login.css with the shared error token defined in /Users/nick/code/template-hono-spa/src/style.css
- [X] T008 [US1] Review maintained color usage in /Users/nick/code/template-hono-spa/src/client/components/card.css and /Users/nick/code/template-hono-spa/src/client/routes/home.css to align any shared semantic usages with the finalized root token names from /Users/nick/code/template-hono-spa/src/style.css

**Checkpoint**: User Story 1 should now be visually consistent and independently reviewable

---

## Phase 4: User Story 2 - Update Colors From One Source (Priority: P2)

**Goal**: Ensure maintainers can update any approved interface color from one shared source instead of editing scattered style rules

**Independent Test**: Change one semantic token in `src/style.css` and verify every dependent maintained style updates without further file edits

- [X] T009 [US2] Normalize all maintained color references in /Users/nick/code/template-hono-spa/src/style.css, /Users/nick/code/template-hono-spa/src/client/components/nav.css, /Users/nick/code/template-hono-spa/src/client/components/card.css, and /Users/nick/code/template-hono-spa/src/client/routes/login.css so they point to one canonical semantic token each
- [X] T010 [US2] Remove any now-unused duplicate color tokens from /Users/nick/code/template-hono-spa/src/style.css after all maintained consumers have been migrated

**Checkpoint**: User Story 2 should now support single-source color updates

---

## Phase 5: User Story 3 - Add New Styles Predictably (Priority: P3)

**Goal**: Prevent future regressions by making the shared color-token rule easy to follow and automatically enforceable

**Independent Test**: Add a temporary direct color literal to a maintained stylesheet and confirm the automated regression check fails; remove it and confirm the check passes

- [X] T011 [US3] Add a regression test in /Users/nick/code/template-hono-spa/test/unit.spec.ts that scans maintained repository-owned stylesheets for blocked direct color literals and raw named colors
- [X] T012 [US3] Document the manual validation and future token-usage expectations in /Users/nick/code/template-hono-spa/specs/016-css-color-vars/quickstart.md and /Users/nick/code/template-hono-spa/specs/016-css-color-vars/contracts/color-token-contract.md

**Checkpoint**: User Story 3 should now protect future styling work against direct color regressions

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [X] T013 Run lint and test validation from /Users/nick/code/template-hono-spa/package.json using the commands documented in /Users/nick/code/template-hono-spa/specs/016-css-color-vars/quickstart.md
- [X] T014 Update the validation log in /Users/nick/code/template-hono-spa/specs/016-css-color-vars/quickstart.md with implementation results and any manual review notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and should follow User Story 1 once the shared visitor-facing usages are migrated
- **User Story 3 (Phase 5)**: Depends on Foundational completion and can begin after the token naming is stable from User Story 2
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **US1**: No dependency on other user stories after Phase 2
- **US2**: Benefits from US1 completing first because it removes the highest-visibility usages before token consolidation cleanup
- **US3**: Depends on US2 because the regression rule should target the final token naming scheme

### Within Each User Story

- Shared token definitions before consumer migration
- File-local replacements before cleanup of unused tokens
- Regression enforcement after the token scheme is finalized
- Full validation after all code and docs are updated

### Parallel Opportunities

- `T001` and `T002` can overlap once the task owner understands the feature scope
- `T005` and `T006` can run in parallel because they modify different files
- `T011` and `T012` can run in parallel once User Story 2 is complete because they target different files and concerns

---

## Parallel Example: User Story 1

```bash
Task: "Replace direct title, avatar, link, and outline color literals in /Users/nick/code/template-hono-spa/src/style.css with shared semantic tokens"
Task: "Replace mobile navigation overlay, button, link, and icon color literals in /Users/nick/code/template-hono-spa/src/client/components/nav.css with shared inverse/surface tokens"
```

---

## Parallel Example: User Story 2

```bash
Task: "Normalize all maintained color references in /Users/nick/code/template-hono-spa/src/style.css, /Users/nick/code/template-hono-spa/src/client/components/nav.css, /Users/nick/code/template-hono-spa/src/client/components/card.css, and /Users/nick/code/template-hono-spa/src/client/routes/login.css so they point to one canonical semantic token each"
Task: "Prepare the unused-token removal pass in /Users/nick/code/template-hono-spa/src/style.css after all maintained consumers have been migrated"
```

---

## Parallel Example: User Story 3

```bash
Task: "Add a regression test in /Users/nick/code/template-hono-spa/test/unit.spec.ts that scans maintained repository-owned stylesheets for blocked direct color literals and raw named colors"
Task: "Document the manual validation and future token-usage expectations in /Users/nick/code/template-hono-spa/specs/016-css-color-vars/quickstart.md and /Users/nick/code/template-hono-spa/specs/016-css-color-vars/contracts/color-token-contract.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate `/`, `/about`, and `/login` against the User Story 1 independent test

### Incremental Delivery

1. Finish Setup and Foundational work to lock the token scheme
2. Deliver User Story 1 for visible consistency across shared UI
3. Deliver User Story 2 for single-source maintainer updates
4. Deliver User Story 3 for future regression protection
5. Finish with lint, tests, and quickstart validation log updates

### Parallel Team Strategy

1. One developer completes Setup and Foundational tasks
2. A second developer can take `T005` while another takes `T006` during User Story 1
3. Once User Story 2 stabilizes the token scheme, one developer can add the regression test while another refreshes contract and quickstart docs

---

## Notes

- Every task uses the required checklist format with a checkbox, sequential task ID, and exact file path
- User story tasks include the required `[US1]`, `[US2]`, or `[US3]` labels
- Parallel markers are only applied where file ownership does not conflict
- The MVP scope is User Story 1 after Setup and Foundational phases
