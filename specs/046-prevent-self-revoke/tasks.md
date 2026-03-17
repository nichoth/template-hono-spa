# Tasks: Prevent Self-Revoke

**Input**: Design documents from `specs/046-prevent-self-revoke/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are included in each description

---

## Phase 1: No Setup Required

No new project structure, dependencies, or schema changes are needed.
`device_id` tracking on sessions is already in place from feature 045.
Proceed directly to user story phases.

---

## Phase 2: User Story 1 - Disable Revoke Button for Current Device (P1)

**Goal**: The "Revoke" button is disabled and non-interactive for the
device matching the current session, preventing any UI path to
self-revocation.

**Independent Test**: Log in, navigate to the profile/devices page.
Confirm the current device's revoke button has the `disabled` attribute
and clicking it has no effect. Confirm all other devices' revoke buttons
remain enabled.

### Implementation for User Story 1

- [x] T001 [US1] Update the revoke button `disabled` expression in
  `src/client/routes/profile.ts` to add
  `|| device.deviceId === currentDeviceId.value` alongside the existing
  `!canRevoke.value` and `revokePending` checks (lines ~297 and ~307-313)

- [x] T002 [US1] Update the revoke button `title` attribute in
  `src/client/routes/profile.ts` to return "Cannot revoke the device
  you are currently using" when `device.deviceId === currentDeviceId.value`
  (add as first branch before the existing `canRevoke` check, ~line 300)

- [x] T003 [US1] Simplify the `onClick` handler on the revoke button in
  `src/client/routes/profile.ts` — remove the branch that checks
  `device.deviceId === currentDeviceId.value` and opens the dialog;
  always call `onRevokeDevice(device.deviceId)` directly (~lines 285-296)

- [x] T004 [US1] Remove the `confirmRevokeDeviceId` signal declaration
  (~line 89) and the `<ModalWindow>` confirmation dialog block (~lines
  323-355) from `src/client/routes/profile.ts`; remove any import or
  usage of `ModalWindow` that is no longer referenced

**Checkpoint**: Revoke button for current device is disabled in the UI.
All other devices' revoke buttons work as before.

---

## Phase 3: User Story 2 - Server Rejects Self-Revoke Requests (P2)

**Goal**: The server returns HTTP 403 (`self_revoke`) when a revoke
request targets the same device that authenticated the session, regardless
of how the request was made.

**Independent Test**: Submit a `PATCH
/api/auth/passkey/devices/:deviceId/revoke` request where `:deviceId`
equals the current session's device ID. Confirm the response is 403 with
`error: "self_revoke"` and the device remains active.

### Implementation for User Story 2

- [x] T005 [US2] Add `currentSessionDeviceId: string | null` as a third
  parameter to `revokeRegisteredDevice` in `src/server/auth/index.ts`
  (~line 646), and add a guard before the existing ownership check:
  if `deviceID === currentSessionDeviceId` (and value is non-null),
  throw `AuthError(403, 'self_revoke', 'Cannot revoke the device you
  are currently using.')`

- [x] T006 [P] [US2] Update the `PATCH
  /api/auth/passkey/devices/:deviceId/revoke` handler in
  `src/server/index.ts` (~line 247) to pass `session.currentDeviceId`
  as the third argument to `authService.revokeRegisteredDevice`

- [x] T007 [P] [US2] Add a unit test to `test/unit.spec.ts` that
  verifies `revokeRegisteredDevice` (or the revoke endpoint) returns
  403 with `error: "self_revoke"` when the target device ID matches
  the session's current device ID

**Checkpoint**: Server rejects self-revoke with 403. Non-self revoke
requests continue to work correctly.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T008 Run `npm test && npm run lint` and fix any failures or
  warnings introduced by this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Skipped — no work required
- **Phase 2 (US1 - client)**: No blocking prerequisites; can start
  immediately
- **Phase 3 (US2 - server)**: No blocking prerequisites; can start
  immediately and in parallel with Phase 2
- **Phase 4 (Polish)**: Requires Phase 2 and Phase 3 to be complete

### User Story Dependencies

- **US1** and **US2** are fully independent — different files, no
  shared state. They can be implemented in parallel.

### Within Each User Story

- **US1**: T001 → T002 → T003 → T004 (sequential; same file sections)
- **US2**: T005 first (adds the parameter), then T006 and T007 in
  parallel (different files)

### Parallel Opportunities

- US1 and US2 phases can be executed concurrently
- T006 and T007 within US2 can run in parallel

---

## Parallel Example: Both Stories Together

```bash
# Start US1 and US2 in parallel after no setup is needed:
Task A (US1): "Update revoke button disabled/title/onClick in profile.ts"
Task B (US2): "Add self-revoke guard to revokeRegisteredDevice"

# After T005 completes:
Task B1: "Update server endpoint to pass currentDeviceId" (T006)
Task B2: "Add unit test for self-revoke rejection"       (T007)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001–T004 (client disable button)
2. **STOP and VALIDATE**: Load profile page, confirm current device
   button is disabled
3. Proceed to US2 for server-side enforcement

### Incremental Delivery

1. US1 → visual protection (button disabled in UI)
2. US2 → security enforcement (server rejects bypass attempts)
3. Polish → confirm all tests pass

### Parallel Team Strategy

With two developers:
- Developer A: T001–T004 (US1, client)
- Developer B: T005–T007 (US2, server + test)
- Both: T008 (polish, after both complete)

---

## Notes

- No schema changes required — `device_id` on `sessions` is already
  populated by feature 045
- The `ModalWindow` dialog removed in T004 was only used for the
  current-device revoke path; removing it is safe
- Error code `self_revoke` follows the existing `not_owner` /
  `last_device` 403/409 pattern in the codebase
- Validation order in `revokeRegisteredDevice` after change:
  1. Device exists (404)
  2. Ownership check (403 `not_owner`)
  3. Self-revoke check (403 `self_revoke`) ← new
  4. Last-device check (409 `last_device`)
