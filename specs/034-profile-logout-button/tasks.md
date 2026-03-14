---
description: "Task list for adding the profile logout button"
---

# Tasks: Add logout button on profile route

**Input**: Design documents from `/specs/034-profile-logout-button/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual verification guided by `quickstart.md`.

## Format: `- [ ] [TaskID] [P?] [Story?] Description`
- [P] indicates the task can execute in parallel with others in the same phase.
- [Story] connects the task to a user story (e.g., US1).
- Descriptions include precise file paths or documentation references.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Understand the current logout/session flow and confirm available styling variables before touching feature files.

- [x] T001 Review `specs/034-profile-logout-button/spec.md` and related docs to fix the scope and ensure the logout story is well understood.
- [x] T002 Audit `src/client/login-status.ts` to confirm the existing logout handler, session signals, and how the header controls render for authenticated users.
- [x] T003 Verify the custom media and typography tokens in `src/_variables.css` so we know which LightningCSS breakpoints and `rem`-based styles are available for the desktop-only button.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare shared session state and reusable handlers so the profile route can safely surface the logout control.

- [x] T004 Propagate `logoutInProgress` and `logoutError` flags (as described in `data-model.md`) through `src/client/state.ts`/`login-status.ts` so downstream UI can read pending/failure states.
- [x] T005 Expose a `handleLogout` callback from `src/client/login-status.ts` that cleans session context and reports errors; document the contract in `contracts/ui.md` for the profile header to consume.
- [x] T006 Confirm that `src/client/routes/profile.ts` imports the session signals it needs (e.g., `isAuthenticated`, `logoutInProgress`, `logoutError`) and leaves space in the layout for a desktop-only control.

---

## Phase 3: User Story 1 - Surface logout on profile (Priority: P1) 🎯 MVP

**Goal**: Add a desktop-only logout button to the `/profile` header area that mirrors the existing logout flow and gives clear pending/error feedback.

**Independent Test**: Follow `quickstart.md` to visit `/profile`, confirm the logout button renders beside the avatar/text when authenticated, click it, and verify the session clears while showing appropriate feedback.

### Tests for User Story 1

- [ ] T007 [US1] Validate manually via `quickstart.md` steps that the logout button is visible, triggers the shared handler, and surfaces pending/success/error states without leaving `/profile`.

### Implementation for User Story 1

- [x] T008 [US1] Update `src/client/routes/profile.ts` to render a logout button near the avatar area, hide it when `isAuthenticated` is false, and wire it to the exposed `handleLogout` callback.
- [x] T009 [US1] Style the button via `src/client/routes/profile.css` (or `src/style.css` if shared) so it inherits the desktop typography (≥1rem) and aligns with the header layout defined in `profile.ts`.
- [x] T010 [US1] Use `src/_variables.css` custom media breakpoints to keep the button desktop-only (e.g., show only above the largest mobile breakpoint) while preserving existing spacing.
- [x] T011 [US1] Ensure the button reflects pending/error states from `logoutInProgress`/`logoutError` (disabled+spinner text when pending, inline message when error) so users understand the current status.
- [x] T012 [US1] Confirm that after logout completes the profile header removes authenticated UI (avatar/text/button) and landing/entry content is restored per spec.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Wrap up documentation, manual verification, and ensure styling consistency.

- [ ] T013 [P] Update `quickstart.md` steps if UI tweaks change the verification flow (e.g., add notes about retrying on failure).
- [ ] T014 [P] Run the manual quickstart checklist locally (`npm run dev` → `/profile`) and note any follow-up adjustments needed in `specs/034-profile-logout-button/quickstart.md`.
- [ ] T015 [P] Confirm no lint/style issues were introduced by running `npm run lint` and `npm run test` (if fast) or document skipped checks if not feasible.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Informational tasks; can start immediately.
- **Foundational (Phase 2)**: Blocks user story work until session state + handler readiness are confirmed.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion; no other stories exist.
- **Polish (Phase 4)**: Runs after the feature is implemented and manually verified.

### Parallel Opportunities
- [P] tasks in Setup (T002, T003) can execute concurrently.
- Polish tasks (T013-T015) can run in parallel once implementation is stable.

### Within User Story 1
- Pending/error state wiring (T008-T011) should come before final UI clean-up (T012).
- Manual validation (T007) can occur once the button is wired but before final polish.

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup tasks to understand the existing logout flow.
2. Finish Foundational tasks so session signals and handlers are reusable.
3. Implement the logout button rendering, styling, and feedback states (Phase 3 tasks).
4. Validate via the quickstart steps (T007).
5. Polish and document any outstanding verification notes (Phase 4 tasks).

### Incremental Delivery
1. Setup and Foundational phases ensure infrastructure and shared state are ready.
2. Deliver the logout button as the single MVP slice (User Story 1).
3. Polish documentation and manual tests without blocking future stories.

### Parallel Team Strategy
1. One developer finalizes Phase 1 (docs/handler audit).
2. Another developer readies session signals (Phase 2).
3. A third developer implements and styles the button (Phase 3) while Phase 4 runs concurrently once verification begins.

---
