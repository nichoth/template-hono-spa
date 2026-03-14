# Tasks: Email Confirmation Route

**Input**: Design docs in `/specs/029-email-confirm-route/` (plan, spec, research, data model, contracts, quickstart).  
**Prerequisites**: Plan and spec already in place; foundation tasks prepare API + DB support before stories start.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the SPA shell to accept a dedicated confirm route before implementing story logic.

- [x] T001 [P] Create `src/client/routes/confirm.ts` stub that exports a `ConfirmRoute` component scaffold (loading banner, success/error placeholders, CTA area, accessible regions) so the router can import it without compile errors.
- [x] T002 Update `src/client/routes/index.ts` to export `ConfirmRoute`, add `/confirm` (and `/confirm/:code`) to `knownClientRoutes`, and register the new route so the shell never falls back to 404 when the path is hit.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Guarantee server-side support for confirmation codes (schema, DB helpers, service logic, API endpoint) before any user story can rely on them.

- [x] T003 Add an `email_confirmation_codes` table definition to `src/server/db/schema.ts` (fields from the ConfirmationCode entity: `code`, `identifier`, `expires_at`, `status`, `created_at`, `updated_at`) so D1 can store pending tokens.
- [x] T004 Extend `src/server/db/index.ts` with helpers to create, fetch, and mark confirmation codes (e.g., `createConfirmationCode`, `findConfirmationCode`, `markConfirmationCodeUsed/Expired`) using the new table.
- [x] T005 Implement `confirmRegistration` (or similarly named) in `src/server/auth/index.ts` that validates a submitted code, ensures it is pending/unused, activates the user record, and returns structured success/error responses matching `api-confirm.md`.
- [x] T006 Register `POST /api/confirm` inside `src/server/index.ts`, call the new auth service helper, translate its outcome into the contract responses (200, 400, 409, etc.), and ensure code logging is gated behind the localhost/dev check per the specification.

---

## Phase 3: User Story 1 - Confirm via emailed code (Priority: P1) 🎯 MVP

**Goal**: Let users land on `/confirm/<code>`, auto-submit the code (and identifier when available) to `/api/confirm`, and surface a success banner with CTA to login without manual copying.

**Independent Test**: Load `http://localhost:8888/confirm/abc123` with a mocked `/api/confirm` success response; ensure the confirm view shows a loading state, sends the POST, then displays the success banner with identifier (if available) and a “Go to Login” button.

### Parallel Example: US1

```bash
# Run API confirm contract mock while building the view component
Task: "Build confirm view component (src/client/routes/confirm.ts)"
Task: "Add confirm helper in state.ts that POSTs to /api/confirm"
```

### Implementation

- [x] T007 [US1] Add a `confirmAccount` helper in `src/client/state.ts` that accepts `{ code, identifier? }`, calls `/api/confirm`, resolves success/error payloads, and surfaces the identifier for UI copy.
- [x] T008 [US1] Flesh out `ConfirmRoute` inside `src/client/routes/confirm.ts` (loading indicator, `aria-live` banner, success copy, decoded identifier display, “Go to Login” CTA) and consume `State.confirmAccount`.
- [x] T009 [P] [US1] Ensure the route reads the path segment (and `identifier` query when present), decodes it safely, stores it in route context, and passes both values to the helper before showing success state once the POST resolves.

---

## Phase 4: User Story 2 - Invalid or expired code (Priority: P2)

**Goal**: When `/api/confirm` rejects the code, keep the user on `/confirm/<code>`, show an error message, and provide a “Request new code” recovery action.

**Independent Test**: Visit `/confirm/invalid` with `/api/confirm` returning a 400/409 error; confirm the UI renders the error, does not redirect, and renders the recovery CTA.

### Parallel Example: US2

```bash
# Error-state UI and recovery action can be developed in parallel
Task: "Map API error codes to user-friendly copy in src/client/routes/confirm.ts"
Task: "Add recovery action (CTA/link) that reinvokes code delivery or navigates to /signup"
```

### Implementation

- [x] T010 [US2] Extend the error handling logic in `src/client/routes/confirm.ts` to recognize `invalid_code`, `expired_code`, and generic failures, surface accessible error banners, and keep the user on route with a retry option.
- [x] T011 [US2] Implement the “Request new code” action inside `ConfirmRoute` (button/link in the error panel) that reuses an existing send-flow (e.g., route to `/signup` with the identifier prefilled or invoke a `State.resendConfirmationCode` helper) so the user can rebuild and re-trigger email delivery.

---

## Phase 5: User Story 3 - Navigating without a code (Priority: P3)

**Goal**: Provide guidance when `/confirm` or `/confirm/` is visited without a code, avoiding API calls and showing paths to login or resend a link.

**Independent Test**: Visit `/confirm` without a code; verify no POST happens, guidance copy is shown, and the CTA points to login/resend.

### Parallel Example: US3

```bash
# Guidance content and CTA targets are independent
Task: "Write guidance copy and CTA for missing code inside src/client/routes/confirm.ts"
Task: "Ensure route detection logic skips API calls when code segment is absent"
```

### Implementation

- [x] T012 [US3] Update the `ConfirmRoute` view (or router guard) so that when no code segment exists the component bypasses the `/api/confirm` call, shows contextual guidance, and renders an accessible CTA to `/login` or `/signup`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap up documentation, accessibility, logging, and quickstart verification for the entire feature.

- [x] T013 [P] Update `specs/029-email-confirm-route/quickstart.md` with the new route steps (error + guidance scenarios) so QA/devs can validate the flow end-to-end.
- [x] T014 [P] Audit `src/client/routes/confirm.ts` and relevant helpers to ensure all dynamic status messages use `aria-live`, keyboard focus lands in banners on load, and success/error CTAs are focusable; document any additional notes in the route file comments.

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2**: The confirm route stub (Phase 1) ensures the SPA compiles; Phase 2 foundation (DB/schema/service/API) enables stories.  
- **User Story Order**: Blocked on Phase 2. After foundation is ready, US1 (valid code) is MVP; US2/US3 can run in parallel, but US2 should ideally follow US1 to reuse success helpers while US3 is independent.  
- **Parallel Opportunities**: 
  - Phase 1 tasks T001/T002 are [P] and run together.
  - Phase 3 tasks T007/T008/T009 can be executed concurrently (components vs. helper logic).
  - Phase 4 tasks T010/T011 can be parallelized due to separation of error copy and recovery action.
  - Phase 6 tasks T013/T014 are [P] finishers.

### User Story Dependency Graph

- US1 (P1) → foundational Phase 2  
- US2 (P2) → requires Phase 2 + best if US1 helpers exist  
- US3 (P3) → Phase 2 only; independent of US1/US2

## Implementation Strategy

### MVP First

1. Complete Phase 1 setup to make `/confirm` route available.  
2. Execute Phase 2 foundation so the server can validate codes via `/api/confirm`.  
3. Finish Phase 3 (US1) to deliver success state for valid codes and stop for MVP validation.  
4. Validate by hitting `/confirm/<code>` with a stubbed API response before adding other stories.

### Incremental Delivery

1. Phase 1 + 2 enable basic routing + API contract.  
2. US1 success path completes the confirmation journey for valid codes.  
3. US2 then layers error handling + recovery actions.  
4. US3 adds “missing code” guidance without affecting the API.  
5. Phase 6 polishes accessibility/logging and updates docs/quickstart.

### Parallel Team Strategy

1. Two engineers finish Phase 1 and 2 together (client route + server API).  
2. Developer A builds the success path (US1), Developer B covers invalid-code UX (US2), Developer C writes missing-code guidance (US3).  
3. Final pair audits accessibility, logging, and docs (Phase 6).
