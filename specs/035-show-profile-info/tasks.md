---
description: "Task list template for feature implementation"
---

# Tasks: Show Profile Info

**Input**: Design documents from `/specs/035-show-profile-info/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the workspace baseline before editing auth/session code.

- [ ] T001 Run `npm install` from /Users/nick/code/template-hono-spa (`package.json`) so dependencies are up to date before touching the auth/session stack.
- [X] T002 Run `npm run lint` from /Users/nick/code/template-hono-spa (`package.json`) to capture pre-change warnings in the shared codebase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prepare the database schema so the session contract can persist the login method flag.

- [X] T003 [P] Update `src/server/db/schema.ts` to add a non-nullable `login_method` column (enum `passkey`/`password`) to the `users` table so each account records its authentication type.
- [X] T004 [P] Extend `migrations/0001_auth_schema.sql` with the same `login_method` column and a sensible default so new Cloudflare D1 deployments create the field.

**Checkpoint**: Database schema changes complete; session response can now surface the login method for stories to build on.

---

## Phase 3: User Story 1 - Profile summary visibility (Priority: P1)

**Goal**: Deliver a `/profile` card that shows identifier, display name, login method, and session expiration using the session payload fields.
**Independent Test**: Authenticate locally, visit `/profile`, and verify the page renders labeled rows for the four values and the logout control while matching `/api/session`.

- [X] T005 [US1] Update `src/server/auth/index.ts` so `makeAuthenticatedSessionResponse` reads `users.login_method` and exposes it both under `user.login_method` and as the top-level `loginMethod` field returned by `/api/session`.
- [X] T006 [US1] Expand `src/client/state.ts`'s `SessionResponse` type plus the `State.restoreSession`/logout/login helpers to accept the new `loginMethod` field so the SPA stores the authentication type in `state.user`.
- [X] T007 [US1] Update `src/client/routes/profile.ts` to render a profile card inside the page body that reads `state.user.value.data` and displays labeled rows for identifier, display name, login method, and session expiry when authenticated.

### Parallel Execution Example: User Story 1

- Dev A modifies `src/server/auth/index.ts` while Dev B extends `src/client/state.ts`; after both finish, Dev C wires the UI in `src/client/routes/profile.ts`.

---

## Phase 4: User Story 2 - Status verification (Priority: P2)

**Goal**: Make the UI reactively reflect any server-side login method changes so the profile card always matches the latest session metadata.
**Independent Test**: Change the login method for the seeded account, refresh the page, and confirm the login method row (and login status label) updates without manual DOM tweaks.

- [X] T008 [US2] In `src/client/routes/profile.ts`, add a `useComputed` derived profile view so the row data re-computes whenever `state.user.value.data` changes, keeping the login method and expiration synced after session refresh.
- [X] T009 [US2] Update `src/client/login-status.ts` to include the `loginMethod` value when available so the header status text mirrors what `/profile` shows.

### Parallel Execution Example: User Story 2

- While one engineer wires the `useComputed` profile view in `profile.ts`, another confirms the login status text picks up the same `loginMethod` field in `login-status.ts`.

---

## Phase 5: User Story 3 - Graceful defaults (Priority: P3)

**Goal**: Provide clear fallback text and accessibility hints when any profile attribute is missing.
**Independent Test**: Mock a session where `displayName` or `loginMethod` is null and verify `/profile` renders `(not set)`/`Unknown method` plus an accessible hint while still showing the logout control.

- [X] T010 [US3] In `src/client/routes/profile.ts`, render `(not set)` when `displayName` is falsy and show `Expires: Unknown` when the expiration timestamp is missing so the layout never leaves blank cells.
- [X] T011 [US3] Add an `aria-live` or visually hidden hint inside `src/client/routes/profile.ts` that explains when the login method row reports `Unknown method`, maintaining screen-reader clarity.

### Parallel Execution Example: User Story 3

- The same developer can add both fallbacks and accessibility hints inside `profile.ts`, but they can still be broken into focus areas (data vs accessibility) if two people work in parallel.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap up documentation and verification for the entire feature.

- [ ] T012 [P] Update `specs/035-show-profile-info/quickstart.md` (if needed) and execute the documented manual checks to confirm identifier, login method, and expiration rows match `/api/session`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 → Phase 2**: Setup tasks prepare the workspace; database schema updates must wait for them to complete.
- **Phase 2 → Story Phases**: Foundation changes (login_method column) block all user stories until complete.
- **Story Phases → Phase 6**: The polish phase runs after all user stories implement their functionality.

### User Story Dependencies

- **US1 (Profile summary visibility)** depends on Phase 2 to ensure the login method column exists and on T005/T006 for the data contract; UI work may require backend data to verify.
- **US2 (Status verification)** depends on US1 so the reactive view and header text work against the newly exposed `loginMethod` field.
- **US3 (Graceful defaults)** depends on US1/US2 because it layers fallbacks and accessibility on the enriched profile card.

### Dependency Graph

- Phase 1 → Phase 2 → US1 → US2 → US3 → Phase 6

### Parallel Opportunities

- T003 and T004 (schema/migration) can run in parallel because they touch different files.
- Within US1, T005 and T006 can run in parallel until the UI wiring (T007) needs the new data, enabling overlapping backend/state work.
- US2 tasks T008 and T009 operate on separate client files (`profile.ts` vs `login-status.ts`) and can be parallelized.
- US3 tasks focus on fallbacks/instructions within `profile.ts`; they can be tackled by separate developers if needed due to their distinct focuses (data vs accessibility).
- Polishing (T012) can proceed once all user stories are done and does not block the earlier phases.

### Implementation Strategy

- **MVP**: Complete US1 (T005-T007) so `/api/session`, `state.user`, and the profile UI all surface identifier, display name, login method, and expiration.
- **Next**: Enable reactive updates (US2) so any server-side login method change immediately appears in the profile card and header.
- **Final**: Layer graceful fallbacks/accessibility (US3) plus polish to keep the page readable for legacy accounts and document the manual checks in `quickstart.md`.
