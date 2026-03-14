---
description: "Task list for hiding Login and Create Account links when authenticated"
---

# Tasks: Hide auth links

**Input**: Design docs in `/specs/031-hide-auth-links/` (plan.md, spec.md, research.md, data-model.md, contracts/session-response.md, quickstart.md)  
**Prerequisites**: Work on branch `031-hide-auth-links`, confirm Node deps installed (`npm install`)  
**Tests**: Vitest suite (`npm test`) plus new unit tests for navigation filtering  
**Organization**: Tasks follow the user stories from spec.md so each story can be implemented and tested independently

## Phase 1: Setup (Shared infrastructure)

**Purpose**: Tag navigation data with metadata so filtering logic can target the auth links without touching other entries.

- [X] T001 [P] Update `src/client/routes/index.ts` so the Login and Create Account route definitions include an explicit `isAuthLink: true` flag (other routes keep `isAuthLink: false` or undefined).
- [X] T002 [P] In `src/client/routes/index.ts`, export a helper `getNavRoutes(authenticated: boolean)` that returns all routes when not authenticated and filters out `isAuthLink` entries when the argument is `true`.

---

## Phase 2: Foundational (Blocking prerequisites)

**Purpose**: Surface the session state inside the nav component so desktop and mobile menus share the filtered route list.

- [X] T003 Import `getNavRoutes` and `state.user` into `src/client/components/nav.ts`, create a `useComputed` signal that derives the display list based on `state.user.value.data?.authenticated`, and expose that list for both desktop and mobile renderers.

---

## Phase 3: User Story 1 - Authenticated header cleanliness (Priority: P1) 🎯 MVP

**Goal**: Hide Login/Create Account from the desktop navigation once the session reports authenticated.

**Independent Test**: Sign in, load the desktop header, and verify Login/Create Account are removed while other links stay.

### Implementation for User Story 1

- [X] T004 [US1] Update the `<ul class="nav-links">` render loop in `src/client/components/nav.ts` to iterate over the computed list so authenticated sessions render only filtered routes for both desktop and mobile navs.

---

## Phase 4: User Story 2 - Anonymous navigation availability (Priority: P2)

**Goal**: Keep Login/Create Account visible for anonymous or pending sessions so auth flows stay reachable.

**Independent Test**: Open the app with no session and confirm the nav includes Login/Create Account.

### Tests for User Story 2

- [X] T005 [US2] Extend `test/unit.spec.ts` with unit tests that call `getNavRoutes(true)` and `getNavRoutes(false)` to prove the helper hides auth links only when authenticated and keeps them otherwise.

---

## Phase 5: User Story 3 - Responsive parity (Priority: P3)

**Goal**: Ensure the mobile menu shares the same filtered route list so authenticated users see the same nav on any device.

**Independent Test**: Sign in, switch to a mobile viewport, open the menu, and verify Login/Create Account remain hidden there as well.

### Implementation for User Story 3

- [X] T006 [US3] Confirm the mobile nav (`<ul class="nav-links-mobile">` in `src/client/components/nav.ts`) uses the same computed route list derived in T003 so filtering applies uniformly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Surface the nav change in docs and verify with the CI test suite.

- [X] T007 Update `specs/031-hide-auth-links/quickstart.md` to describe verifying auth-link visibility for authenticated and anonymous sessions plus the responsive menu.
- [X] T008 [P] Run `npm test` to ensure the Vitest suite, including the new nav helper tests, passes after the changes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; tag the routes data first.
- **Foundational (Phase 2)**: Depends on Setup so nav filtering can reuse the helper.
- **User Stories (Phase 3+)**: Each builds on the filtered route list; they can run sequentially by priority.
- **Polish (Phase 6)**: Depends on completing all stories before doc/test wrap-up.

### User Story Graph

```
   Phase 2 ───► US1 (P1) ───► US2 (P2) ───► US3 (P3) ───► Polish
```

User stories are independent after the foundational filtering helper exists, but priority suggests finishing US1 (authenticated view) before US2/US3.

## Parallel Execution Examples

- **User Story 1**: Task T004 can run in parallel with T005 in another workspace because they touch different files (`nav.ts` vs `test/unit.spec.ts`).
- **User Story 2**: T005 (tests) can run while T006 (mobile refactor) finalizes since the mobile menu uses the same computed list and both depend only on T003’s shared logic.
- **Phase 6**: T007 doc update and T008 test run can be executed concurrently once all user stories are implemented.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Finish Setup + Foundational (T001–T003) to prep the filtering helper.
2. Implement T004 so desktop nav drops auth links when `authenticated:true`.
3. Validate manually or via Story 1 test before progressing.

### Incremental Delivery

1. Add T005 to prove anonymous sessions keep the links.
2. Apply T006 to confirm the mobile menu uses the filtered list.
3. Finish T007/T008 for docs and CI verification.
4. Run additional checks or demos after each story if needed.

### Parallel Team Strategy

1. One developer tags routes and exports the helper (T001–T003).
2. Another developer implements the filtering render (T004) while a third writes the tests (T005).
3. A QA or documentation owner handles the quickstart update and final test run (T007/T008).
