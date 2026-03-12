# Tasks: Mobile Navigation

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/001-mobile-nav/`
**Prerequisites**: [plan.md](/Users/nick/code/template-hono-spa/specs/001-mobile-nav/plan.md), [spec.md](/Users/nick/code/template-hono-spa/specs/001-mobile-nav/spec.md), [research.md](/Users/nick/code/template-hono-spa/specs/001-mobile-nav/research.md), [data-model.md](/Users/nick/code/template-hono-spa/specs/001-mobile-nav/data-model.md), [mobile-nav-contract.md](/Users/nick/code/template-hono-spa/specs/001-mobile-nav/contracts/mobile-nav-contract.md), [quickstart.md](/Users/nick/code/template-hono-spa/specs/001-mobile-nav/quickstart.md)

**Tests**: Automated tests are required for this feature because the implementation plan explicitly calls for unit and integration coverage around shared header/navigation behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (for example `US1`, `US2`, `US3`)
- Each task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Wire the installed hamburger component into the shared client/bootstrap and stylesheet layers.

- [X] T001 [P] Import `@substrate-system/hamburger-two/css` in /Users/nick/code/template-hono-spa/src/style.css
- [X] T002 [P] Register `HamburgerTwo` in /Users/nick/code/template-hono-spa/src/client/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared nav structure and state hooks that all mobile-nav stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Refactor the shared navigation container to support both inline and mobile-menu presentations in /Users/nick/code/template-hono-spa/src/client/components/nav.ts
- [X] T004 [P] Add the responsive layout scaffolding for inline nav, hamburger trigger, and mobile menu container in /Users/nick/code/template-hono-spa/src/client/components/nav.css
- [X] T005 [P] Extend navigation metadata assertions to cover the unchanged route set in /Users/nick/code/template-hono-spa/test/unit.spec.ts

**Checkpoint**: Shared navigation can now support separate mobile and desktop presentations

---

## Phase 3: User Story 1 - Open navigation on mobile (Priority: P1) 🎯 MVP

**Goal**: Show a top-right mobile navigation trigger that opens the mobile menu on compact screens.

**Independent Test**: Open the site on a mobile-sized viewport and confirm that the header shows a menu control in the top-right corner which reveals the site navigation when activated.

### Tests for User Story 1

- [X] T006 [P] [US1] Add source-level nav assertions for the hamburger trigger and open/close event wiring in /Users/nick/code/template-hono-spa/test/unit.spec.ts
- [X] T007 [P] [US1] Add shared-shell coverage confirming the app header still renders for primary routes in /Users/nick/code/template-hono-spa/test/integration.spec.ts

### Implementation for User Story 1

- [X] T008 [US1] Implement the mobile menu trigger in the shared header using `@substrate-system/hamburger-two` in /Users/nick/code/template-hono-spa/src/client/components/nav.ts
- [X] T009 [US1] Position the mobile trigger in the top-right header area for compact screens in /Users/nick/code/template-hono-spa/src/client/components/nav.css

**Checkpoint**: Mobile visitors can find and open the navigation menu from the header

---

## Phase 4: User Story 2 - Use mobile navigation links without clutter (Priority: P2)

**Goal**: Move primary links into the opened mobile menu so the compact header stays clear.

**Independent Test**: Open the site on a mobile-sized viewport and confirm that the navigation links are hidden from the header until the menu is opened, then appear inside the menu.

### Tests for User Story 2

- [X] T010 [P] [US2] Add source-level assertions that primary links render inside the mobile menu container instead of the compact header in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 2

- [X] T011 [US2] Render the primary navigation links inside the mobile menu container in /Users/nick/code/template-hono-spa/src/client/components/nav.ts
- [X] T012 [US2] Hide inline links on compact screens and show the opened mobile menu state in /Users/nick/code/template-hono-spa/src/client/components/nav.css
- [X] T013 [US2] Keep active-route indication visible inside the mobile navigation menu in /Users/nick/code/template-hono-spa/src/client/components/nav.ts

**Checkpoint**: Compact screens show navigation destinations only inside the opened mobile menu

---

## Phase 5: User Story 3 - Preserve existing navigation on larger screens (Priority: P3)

**Goal**: Retain the current inline desktop navigation while avoiding duplicate mobile-menu presentation on larger screens.

**Independent Test**: Open the site on a desktop-sized viewport and confirm that the current inline header navigation remains available without relying on the mobile menu interaction.

### Tests for User Story 3

- [X] T014 [P] [US3] Add assertions that desktop presentation keeps inline navigation available without the compact-only menu state in /Users/nick/code/template-hono-spa/test/unit.spec.ts

### Implementation for User Story 3

- [X] T015 [US3] Preserve desktop inline navigation rendering while limiting the hamburger trigger to compact screens in /Users/nick/code/template-hono-spa/src/client/components/nav.css
- [X] T016 [US3] Ensure the mobile menu closes cleanly after navigation and viewport-state changes in /Users/nick/code/template-hono-spa/src/client/components/nav.ts

**Checkpoint**: Desktop navigation remains familiar while mobile avoids duplicate or stuck-open navigation states

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation updates for shared navigation behavior

- [X] T017 Run the manual responsive validation flow documented in /Users/nick/code/template-hono-spa/specs/001-mobile-nav/quickstart.md
- [X] T018 Run repository validation with `npm run lint` and `HOME=/tmp npm test`, then record any notable outcomes in /Users/nick/code/template-hono-spa/specs/001-mobile-nav/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 because the mobile menu contents rely on the trigger and container created there
- **User Story 3 (Phase 5)**: Depends on User Story 2 because the final desktop/mobile separation builds on the shared responsive nav structure
- **Polish (Phase 6)**: Depends on all user stories completing

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational and is the recommended MVP slice
- **US2 (P2)**: Starts after US1 because it extends the same mobile menu structure
- **US3 (P3)**: Starts after US2 because it finalizes the responsive separation and cleanup behavior

### Within Each User Story

- Test tasks should be written and observed failing before implementation
- Shared nav structure changes come before layout refinements
- Each story should be verified independently before moving to the next priority

### Parallel Opportunities

- `T001` and `T002` can run in parallel during Setup
- `T004` and `T005` can run in parallel once the nav refactor in `T003` is understood
- `T006` and `T007` can run in parallel for US1
- `T010` and `T014` are standalone parallelizable test tasks for their story phases

---

## Parallel Example: User Story 1

```bash
Task: "Add source-level nav assertions for the hamburger trigger and open/close event wiring in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Add shared-shell coverage confirming the app header still renders for primary routes in /Users/nick/code/template-hono-spa/test/integration.spec.ts"
```

## Parallel Example: Setup

```bash
Task: "Import @substrate-system/hamburger-two/css in /Users/nick/code/template-hono-spa/src/style.css"
Task: "Register HamburgerTwo in /Users/nick/code/template-hono-spa/src/client/index.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the mobile trigger opens navigation from the header

### Incremental Delivery

1. Deliver US1 to establish the mobile trigger and menu-opening behavior
2. Add US2 to move links into the menu and declutter the compact header
3. Add US3 to preserve desktop behavior and close responsive edge cases
4. Finish with quickstart and full repo validation

### Suggested MVP Scope

- **MVP**: User Story 1 only
- **Why**: It delivers the visible mobile navigation control and basic opening behavior with the smallest change set

## Notes

- All tasks use the required checklist format with checkbox, task ID, story label where required, and exact file paths
- The feature intentionally leaves route definitions unchanged and focuses on shared navigation presentation only
- Manual responsive validation remains important because the automated suite in this repo does not execute a real browser viewport workflow
