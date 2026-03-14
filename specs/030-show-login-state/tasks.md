---
description: "Task list for the show login state feature"
---

# Tasks: Show login state

**Input**: Design docs in `/specs/030-show-login-state/` (plan.md, spec.md, research.md, data-model.md, contracts/session-response.md, quickstart.md)  
**Prerequisites**: Run `npm install` if dependencies are missing, confirm workspace is on branch `030-show-login-state`  
**Tests**: Vitest unit and integration suites already exist (`npm test`); focus on new helper coverage for login status  
**Organization**: Tasks grouped by user story to keep each implementation slice independently testable and deliverable

## Phase 1: Setup (Shared infrastructure)

**Purpose**: Reserve header slots and styling so user story work can plug in the login indicator without disturbing the nav/avatar layout.

- [X] T001 [P] Insert a `<p class="login-status" aria-live="polite">logged in as anonymous</p>` right after the `<${Nav}>` component in `src/client/index.ts`, keeping the avatar anchor untouched so the layout can later show dynamic text.
- [X] T002 [P] Define the `.login-status` rule in `src/style.css` with nav-link color, `font-size: 1rem`, inline spacing (e.g., `margin-inline-start`), and default desktop visibility so the placeholder inherits the header rhythm.

---

## Phase 2: Foundational (Blocking prerequisites)

**Purpose**: Provide a reusable login-status formatter that all user stories can rely on before they add story-specific behavior.

- [X] T003 Create `src/client/login-status.ts` that exports `formatLoginStatus(session?: SessionResponse | null): string`, returning `logged in as <identifier>` when `authenticated === true` with a non-empty `identifier`, and `logged in as anonymous` for any other state.

---

## Phase 3: User Story 1 - Confirm authenticated user (Priority: P1) 🎯 MVP

**Goal**: Show the logged-in account email/identifier in the desktop header so authenticated users can verify which account is active.

**Independent Test**: Authenticate via the existing flow, refresh/navigate the home screen on a desktop viewport, and verify the header renders `logged in as <email>` between the nav and avatar without altering avatar navigation.

### Tests for User Story 1

- [X] T004 [US1] Add a Vitest unit test in `test/unit.spec.ts` that imports `formatLoginStatus` and asserts it returns `logged in as user@example.com` when supplied a session with `authenticated:true` and `user.identifier`.

### Implementation for User Story 1

- [X] T005 [US1] Update `src/client/index.ts` to import `formatLoginStatus`, create a `useComputed` signal that reads `state.user.value.data`, and bind its output to the `.login-status` element so authenticated sessions render the email text without touching the avatar link.

---

## Phase 4: User Story 2 - Provide anonymous fallback (Priority: P2)

**Goal**: Ensure visitors and failed session restores show the `logged in as anonymous` label so the header never loses its text or shows stale data.

**Independent Test**: Open the app with no session (fresh browser or after clearing cookies) and confirm the desktop header displays `logged in as anonymous` even if `/api/session` is pending or returns `authenticated:false`.

### Tests for User Story 2

- [X] T006 [US2] Extend `test/unit.spec.ts` with a test covering the anonymous path: pass `authenticated:false`, `null`, or a session missing `user.identifier` and assert `formatLoginStatus` still returns `logged in as anonymous`.

### Implementation for User Story 2

- [X] T007 [US2] Harden `formatLoginStatus` in `src/client/login-status.ts` (if needed) so it explicitly treats missing `user`, missing `identifier`, and falsy `authenticated` values as the anonymous path before user story 1 renders anything.

---

## Phase 5: User Story 3 - Preserve mobile header layout (Priority: P3)

**Goal**: Keep the mobile header compact by hiding the login status text below the desktop breakpoint so the nav/avatar spacing stays unaffected.

**Independent Test**: Load the page in a viewport under ~680px and verify the `.login-status` element is hidden while the avatar remains visible and clickable.

### Implementation for User Story 3

- [X] T008 [US3] Add a media query to `src/style.css` that sets `.login-status` to `display:none` (or `visibility:hidden`) for viewports narrower than ~680px, ensuring the desktop-specific text never clips the mobile nav.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Document and verify the new indicator across the feature space.

- [X] T009 Update `specs/030-show-login-state/quickstart.md` to mention verifying both the authenticated email and anonymous fallback on desktop plus re-validating the mobile layout, keeping the quickstart in sync with the implemented behavior.
- [X] T010 [P] Run `npm test` and confirm the Vitest suite still passes after the login-status helper and header updates.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Must finish first to reserve markup and styling hooks.
- **Phase 2 (Foundational)**: Depends on Setup to place the login text; after this, story work can begin.
- **Phase 3-5 (User Stories)**: Each story can start once Phase 2 is complete; stories do not depend on one another beyond priority order.
- **Phase 6 (Polish)**: Depends on all stories for final validation and docs.

### User Story Graph (completion order)

```
      ┌────────────┐
      │ Foundational │
      └────┬───────┘
           │
 ┌─────────▼────────┐
 │   US1 (P1)       │
 └─────────┬────────┘
           │
 ┌─────────▼────────┐
 │   US2 (P2)       │
 └─────────┬────────┘
           │
 ┌─────────▼────────┐
 │   US3 (P3)       │
 └─────────┬────────┘
           │
      ┌────▼────┐
      │  Polish  │
      └──────────┘
```

Each user story is also independently testable after the foundational work; teams can reorder US2 or US3 after US1 as needed, but priority recommends US1 → US2 → US3 for MVP progression.

## Parallel Execution Examples

- **User Story 1**: Write the authenticated helper test and update `src/client/index.ts` simultaneously (they touch different files: `test/unit.spec.ts` and `src/client/index.ts`).
- **User Story 2**: Update `formatLoginStatus` logic and add its anonymous test in parallel because both steps only affect `src/client/login-status.ts` and `test/unit.spec.ts` (they share a file but can be split by ensuring the test references the finalized helper).
- **User Story 3**: While other stories finalize, another developer can add the mobile media query in `src/style.css` on its own branch.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Finish Setup + Foundational phases to prepare the markup, styling, and formatter.
2. Complete User Story 1 tasks so the header renders `logged in as <identifier>` for authenticated desktop users.
3. Validate via the newly added helper test and a manual desktop check.
4. Stop, deploy, or demo this verified UX before extending to anonymous/mobile behavior.

### Incremental Delivery

1. After the MVP, complete User Story 2 to lock down the anonymous fallback (helper logic + test).
2. Next, implement User Story 3’s mobile media query to hide the text on small viewports.
3. Run Phase 6 (docs/tests) to polish the experience once all stories are in place.

### Parallel Team Strategy

1. One developer owns the markup/CSS setup (Phase 1) while another starts the helper file (Phase 2).
2. Once foundational pieces are ready, devs can split per story: one handles the authenticated UI and tests (US1), another focuses on the anonymous paths (US2), while a third tidies the responsive CSS (US3).
3. Phase 6 can be handled by either the QA engineer or the last developer to ensure docs/tests reflect the final behavior.
