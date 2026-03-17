# Tasks: Indicate Current Device

**Input**: Design documents from `/specs/045-indicate-current-device/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are included in descriptions

---

## Phase 1: Setup

No setup required — existing project, no new source files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: D1 schema migration that MUST be complete before any
user-story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is
complete.

- [X] T001 [P] Add `device_id TEXT` to the sessions CREATE TABLE DDL
  in `src/server/db/schema.ts` (fresh-install path)
- [X] T002 [P] Add `device_id: string | null` to the `SessionRecord`
  type in `src/server/db/index.ts`; add idempotent try/catch block
  in `ensureAuthSchema` that runs
  `ALTER TABLE sessions ADD COLUMN device_id TEXT` and silently
  ignores the duplicate-column error (existing-install migration)
- [X] T003 Update `createSession` in `src/server/db/index.ts` to
  accept an optional `deviceId?: string` parameter and bind
  `params.deviceId ?? null` as the last value in the INSERT statement

**Checkpoint**: Schema migration complete — user story implementation
can begin.

---

## Phase 3: User Story 1 - See Current Device Labeled (Priority: P1)

**Goal**: The Profile page shows a "(current device)" label next to the
device associated with the active session. Revoking the current device
shows a confirmation dialog that warns the user they will be logged out.

**Independent Test**: Log in with a passkey → visit the Profile page →
confirm the current device shows "(current device)" and no other device
does. Click Revoke on that device → confirm a dialog appears. Click
Cancel → nothing is revoked. Click "Revoke and log out" → session ends.

### Implementation for User Story 1

- [X] T004 [P] [US1] Add `currentDeviceId: string | null` to the
  `authenticated: true` branch of `SessionResponse` in
  `src/server/auth/index.ts`
- [X] T005 [P] [US1] Add `currentDeviceId?: string | null` to the
  `authenticated: true` branch of `SessionResponse` in
  `src/client/state.ts`
- [X] T006 [US1] Update `makeAuthenticatedSessionResponse` in
  `src/server/auth/index.ts` to accept a `deviceId: string | null`
  parameter and include it as `currentDeviceId` in the return object
- [X] T007 [US1] Update `finishAuthentication` in
  `src/server/auth/index.ts` to pass `device.id` to both
  `createSession` (as `deviceId: device.id`) and
  `makeAuthenticatedSessionResponse` (as the new `deviceId` arg)
- [X] T008 [US1] Update `getCurrentSession` in
  `src/server/auth/index.ts` to include
  `currentDeviceId: session.device_id ?? null` in the return object
- [X] T009 [US1] In `src/client/routes/profile.ts`: add
  `ModalWindow` import from `@substrate-system/dialog` (already
  installed); add `confirmRevokeDeviceId` signal
  (`useSignal<string | null>(null)`); add `dialogRef`
  (`useRef<InstanceType<typeof ModalWindow> | null>(null)`); derive
  `currentDeviceId` computed from `state.user.value.data`; gate Revoke
  button `onClick` to call `dialogRef.current?.open()` when
  `device.deviceId === currentDeviceId.value`, otherwise call
  `onRevokeDevice` directly
- [X] T010 [US1] Add "(current device)" inline label inside the
  `.device-name` span in the device list in
  `src/client/routes/profile.ts`:
  conditionally render
  `html\`<span class="device-current">(current device)</span>\``
  when `device.deviceId === currentDeviceId.value`
- [X] T011 [US1] Add `<modal-window>` confirmation dialog element
  (ref=`dialogRef`) inside the profile section in
  `src/client/routes/profile.ts`, containing: an `<h2>` heading,
  explanatory `<p>` text, Cancel button (`dialogRef.current?.close()`),
  and "Revoke and log out" button (closes dialog then calls
  `onRevokeDevice(confirmRevokeDeviceId.value!)`)
- [X] T012 [P] [US1] Add `@import url("@substrate-system/dialog/css")`
  at top of `src/client/routes/profile.css`; add `.device-current`
  rule (0.8em font-size, muted color, 0.4em left margin); add
  `.dialog-actions` rule (flex, gap 0.75rem, justify-content flex-end,
  margin-top 1.5rem)

**Checkpoint**: All device-identification and revoke-confirmation
features are functional and testable end-to-end.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T013 Run `npm test && npm run lint` and fix any failures
- [ ] T014 Perform manual verification per quickstart.md: passkey login
  → profile shows "(current device)" → revoke dialog appears on current
  device → Cancel closes without revoking → "Revoke and log out"
  ends session → non-current device revokes immediately without dialog

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 ‖ T002 (different files); T003
  depends on T002 (same file, sequential)
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion; T004 ‖
  T005 (different files); T006 depends on T004 (same file); T007 and
  T008 depend on T006 (same file, sequential); T009 depends on T005;
  T010 and T011 depend on T009 (same file, sequential); T012 can run
  in parallel with T009–T011 (different file)

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational phase only — no other
  user stories exist in this feature

---

## Parallel Example: Phase 2

```bash
# Launch in parallel:
Task: "T001 — Add device_id TEXT to sessions DDL in src/server/db/schema.ts"
Task: "T002 — Add SessionRecord field + ALTER TABLE migration in src/server/db/index.ts"

# Then sequentially:
Task: "T003 — Update createSession to accept deviceId in src/server/db/index.ts"
```

## Parallel Example: User Story 1 (Phase 3)

```bash
# Launch in parallel:
Task: "T004 — Add currentDeviceId to server SessionResponse in src/server/auth/index.ts"
Task: "T005 — Add currentDeviceId to client SessionResponse in src/client/state.ts"

# After T004, sequentially:
Task: "T006 — Update makeAuthenticatedSessionResponse in src/server/auth/index.ts"
Task: "T007 — Update finishAuthentication in src/server/auth/index.ts"
Task: "T008 — Update getCurrentSession in src/server/auth/index.ts"

# After T005 (T009-T011 sequential; T012 parallel with them):
Task: "T009 — Add signals, ref, computed, gated onClick in src/client/routes/profile.ts"
Task: "T012 — CSS import + styles in src/client/routes/profile.css"  # parallel
Task: "T010 — Add (current device) label markup in src/client/routes/profile.ts"
Task: "T011 — Add confirmation dialog markup in src/client/routes/profile.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 2 (schema migration — blocks everything)
2. Complete Phase 3 server tasks (T004–T008)
3. Complete Phase 3 client tasks (T005, T009–T012)
4. **STOP and VALIDATE**: `npm test && npm run lint` + manual checks
5. Deploy

### Incremental Delivery

Schema → Server types → Client types → Profile UI → Polish

---

## Notes

- [P] tasks = different files, no sequential dependencies
- T001 and T002 are in different files and can be parallelized
- T006 must precede T007 and T008 (changes signature before callers
  are updated)
- T009 must precede T010 and T011 (signals and ref needed before
  template uses them)
- No new source files — all changes are to 6 existing files
- `@substrate-system/dialog` v0.0.28 is already installed; no `npm
  install` needed
- Commit after each phase checkpoint
