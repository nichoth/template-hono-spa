---

description: "Task list for showing the session expiration line on the profile route"

---

# Tasks: Show session expiration on profile

**Input**: Design documents from `/specs/039-show-session-expiry/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/profile-session-contract.md  
**Tests**: Manual verification via `specs/039-show-session-expiry/quickstart.md` plus Vitest coverage for the formatting helper

## Phase 1: Setup (Project initialization)

**Purpose**: Prepare shared utilities and helper documentation that every story will rely on.

- [X] T001 [P] Create `src/client/utils/session-expiration.ts` exporting a formatter that turns an ISO `expiresAt` string into `YYYY-MM-DD, h:mmam/pm` text plus fallback metadata so UI code can stay simple and reuse the same hints across stories.

---

## Phase 2: Foundational (Blocking prerequisites)

**Purpose**: Wire session metadata into the profile view so Story 1 and Story 2 can render it consistently.

- [X] T002 [P] Refactor `src/client/routes/profile.ts` so `profileView` relies on the formatter helper, surfaces a `sessionExpires` object (label, hint, isFallback flag), and keeps the existing authentication selectors intact while reacting to updated `state.user` data whenever the session refreshes.

---

## Phase 3: User Story 1 - Understand session lifetime (Priority: P1) 🎯 MVP

**Goal**: Display a human-friendly expiration timestamp in the profile summary so authenticated users know how long their session remains valid.

**Independent Test**: Follow step 3–5 in `specs/039-show-session-expiry/quickstart.md`: load `/profile`, check that `Session Expires` shows `2026-04-02, 3:21pm` style text, renew the session, and confirm the value updates to the new expiration.

### Implementation for User Story 1

- [X] T003 [US1] Update `src/client/routes/profile.ts` and `src/client/routes/profile.css` so the `Session Expires` row renders the formatter’s friendly text, keeps the surrounding layout unchanged, and retains `aria-live` hints for screen readers when the timestamp changes.
- [X] T004 [US1] Add `test/session-expiration.test.ts` (Vitest) that feeds a known `expiresAt` timestamp to the helper and asserts the output matches `2026-04-02, 3:21pm` formatting, keeping this regression covered as part of Story 1.

### Parallel Example: User Story 1

While one developer updates the profile markup/CSS, another can write the Vitest file and confirm the formatter output matches the requested style before the UI change lands, ensuring the story stays testable throughout.

---

## Phase 4: User Story 2 - See clear feedback when expiration data is unavailable (Priority: P2)

**Goal**: Surface a polite fallback when the session expiration timestamp is missing or malformed so users understand the absence of data.

**Independent Test**: Follow step 6 in `specs/039-show-session-expiry/quickstart.md` by editing the `/api/session` response to drop or nullify `session.expires` and verify `Session Expires not available` appears with the expected accessible hint.

### Implementation for User Story 2

- [X] T005 [US2] Extend `src/client/utils/session-expiration.ts` and the associated profile rendering so missing/unparsable timestamps produce `Session Expires not available` plus a screen-reader hint rather than raw ISO text, and ensure the UI remains visually stable when the fallback is shown.
- [X] T006 [US2] Add a second test in `test/session-expiration.test.ts` that sends undefined/invalid values to the helper and validates the fallback label and hint are returned, preventing regressions in the error path.

### Parallel Example: User Story 2

Task T005 can proceed alongside T006 because the helper logic is already extracted (Phase 1) and both the UI and tests rely on the same formatter outputs, so frontend and test work can happen independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Tie documentation and verification guidance to the finished implementation.

- [X] T007 Update `specs/039-show-session-expiry/quickstart.md` so the manual validation steps explicitly mention checking the formatted `Session Expires` string, the session-refresh behavior, and the fallback copy after editing `/api/session`.
- [X] T008 Run `npm run lint` and `npm test` (referencing `package.json`) and record the results in the quickstart file to confirm the overall feature passes repository standards (note: `npm test` currently fails because `@cloudflare/vitest-pool-workers` references a missing `./config` export).

---

## Dependencies & Execution Order

**Phase Dependencies**

1. **Phase 1 (Setup)**: No prerequisites, kicks everything off.
2. **Phase 2 (Foundational)**: Blocks all user stories until the formatter and profile wiring exist.
3. **User Stories (Phase 3 & 4)**: Both depend on Phase 2 but are otherwise independent; Story 2 can start as soon as Phase 2 completes without waiting for Story 1.
4. **Polish (Phase 5)**: Depends on both user stories being implemented.

**User Story Dependencies**

- **US1 (P1)**: Requires Phase 2 (profileView wiring).
- **US2 (P2)**: Requires Phase 2 (formatter wiring) but not US1; it is safe to work on in parallel with US1.

**Dependency Graph**

```
Phase 1 → Phase 2 → {US1, US2} → Phase 5
```

## Parallel Opportunities

- **Setup/Foundation**: T001 and T002 are independent; the helper can be authored while the profile wiring plan is drafted.
- **User Stories**: Story 2 can be executed in parallel with Story 1 because both consume the formatter and profile wiring prepared earlier.
- **Polish**: T007 and T008 can run concurrently once the code changes are merged.

## Independent Test Criteria

- **US1**: The quickstart walk-through confirms `Session Expires` shows a `YYYY-MM-DD, h:mmam/pm` string and that the value updates to the refreshed session expiration.
- **US2**: Editing `/api/session` to remove or corrupt `session.expires` makes the UI show `Session Expires not available` with the accessibility hint from the helper.

## Implementation Strategy

Start with the formatter helper (Phase 1) so both stories share the same representation. Wire the profile route to consume the helper (Phase 2) before implementing each story separately—first delivery is the friendly expiration display (Story 1), then the fallback behavior (Story 2). Finish with documentation-plus-validation steps (Phase 5) once both stories are independently testable.
