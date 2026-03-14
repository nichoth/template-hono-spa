---
description: "Task list template for feature implementation"
---

# Tasks: Hide Auth Links

**Input**: Design documents from `/specs/036-hide-auth-links/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the repository dependencies and lint configuration before touching the navigation components.

- [ ] T001 Run `npm install` from `/Users/nick/code/template-hono-spa` (`package.json`) so dependencies are current before editing TypeScript components.
- [X] T002 Run `npm run lint` from `/Users/nick/code/template-hono-spa` (`package.json`) to establish a clean baseline before the UI change.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure the nav route configuration explicitly identifies auth-only entries so filtering is deterministic.

- [X] T003 [P] Update `src/client/routes/index.ts` so `/login` and `/signup` carry `isAuthLink: true` metadata and `getNavRoutes` continues to consume this flag when filtering the published route list.

**Checkpoint**: Nav routes now mark auth-specific entries, allowing subsequent story work to rely on the filtered list downstream.

---

## Phase 3: User Story 1 - Authenticated nav cleanup (Priority: P1) 🎯 MVP

**Goal**: Prevent authenticated visitors from seeing the `Login` and `Create Account` links in both desktop and mobile navigations while keeping the rest of the nav intact.
**Independent Test**: Log in locally, then verify the desktop nav list and hamburger menu only render routes returned by `getNavRoutes(true)` and contain no `Login`/`Create Account` link items.

- [X] T004 [US1] Refactor `src/client/components/nav.ts` so its `visibleRoutes` signal is derived from `state.user.value.data?.authenticated`, and ensure both `.nav-links-inline` and `.nav-links-mobile` reuse `visibleRoutes.value` rather than independently computing their own lists.
- [X] T005 [US1] Simplify `renderNavItems` in `src/client/components/nav.ts` to accept a single route source so auth links disappear uniformly when `visibleRoutes` is filtered.

### Parallel Execution Example: User Story 1

- One engineer wires the shared `visibleRoutes` computed signal while another ensures `renderNavItems` is reused for both nav menus; once both updates are in, QA verifies both navs show the same filtered links.

---

## Phase 4: User Story 2 - Responsive menu sync (Priority: P2)

**Goal**: Guarantee the hamburger menu stays synchronized with the desktop nav after login/logout so there is never a discrepancy in the link set between viewports.
**Independent Test**: Sign in, open the mobile menu, and confirm the same filtered list as the desktop nav. Then log out and ensure the auth links reappear in both places without reloading.

- [X] T006 [US2] In `src/client/components/nav.ts`, hook the hamburger menu render to the same `visibleRoutes` so opening the menu reuses the prefiltered list rather than recomputing from the raw route array.
- [X] T007 [US2] Add a `useComputed` or equivalent guard inside `nav.ts` to re-evaluate `visibleRoutes` anytime `state.user.value.data` changes, guaranteeing the menu refreshes immediately after login/logout.

### Parallel Execution Example: User Story 2

- One engineer focuses on sharing `visibleRoutes` with the desktop nav; a second ensures the hamburger menu component listens to the same signal and triggers re-renders on auth changes.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation for the nav adjustment.

- [X] T008 [P] Cross-check the manual steps in `specs/036-hide-auth-links/quickstart.md` and update if new verification notes (e.g., nav link counts) are needed, then run the described manual checks.
- [X] T009 [P] Capture one screenshot or regression note showing the nav before/after login so QA records the link removal for future comparison.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 → Phase 2**: Setup tasks establish environment before modifying route config.
- **Phase 2 → Story Phases**: Route metadata must exist so both stories operate on the filtered list.
- **Story Phases → Phase 5**: Polish tasks wait for both stories to complete before final verification.

### User Story Dependencies

- **US1 (Authenticated nav cleanup)**: Depends on nav routes marking auth links and refactors to share the filtered list.
- **US2 (Responsive menu sync)**: Depends on US1 to share `visibleRoutes`, then layers on the responsive/hamburger behavior.

### Dependency Graph

- Phase 1 → Phase 2 → US1 → US2 → Phase 5

### Parallel Opportunities

- T001 and T002 can both run concurrently as they touch different commands.
- Phase 2 updates to `src/client/routes/index.ts` (T003) can be done in parallel with story work once the metadata is defined.
- Within US1, reusing `visibleRoutes` and refactoring `renderNavItems` can proceed in parallel until integration.
- US2 tasks focus on hamburger/menu rendering and can proceed while US1 tweaks visible routes as long as the shared list exists.
- Polish tasks T008/T009 can run after US1/US2 complete and in parallel with each other.

### Implementation Strategy

- **MVP**: Finish US1 so both nav menus exclusively use the filtered routes after login.
- **Next**: Complete US2 so the mobile menu immediately mirrors the desktop nav whenever authentication changes.
- **Final**: Execute polish tasks (documentation, screenshot/regression note) to record the new behavior and confirm QA steps.
