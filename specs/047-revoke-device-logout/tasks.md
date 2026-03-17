# Tasks: Immediate Device Logout on Revocation

**Feature**: `047-revoke-device-logout`
**Input**: `specs/047-revoke-device-logout/`
**Tech Stack**: TypeScript (ES2022) + ESM, Hono, Cloudflare Workers, D1 (SQLite),
Vitest + `@cloudflare/vitest-pool-workers`

**Organization**: Tasks grouped by user story. Tests required (FR-005, user request).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1, US2)

---

## Phase 1: Setup

**Purpose**: No project initialization required — feature modifies existing
files only. No schema changes needed.

- [ ] T001 Confirm test suite baseline passes: `npm test`

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add `revokeSessionsByDeviceId` to the DB layer. All user story
work depends on this function existing.

**⚠️ CRITICAL**: US1 implementation cannot begin until T002 is complete.

- [ ] T002 Add `revokeSessionsByDeviceId(db, deviceId, now)` to
  `src/server/db/index.ts` — executes
  `UPDATE sessions SET status = 'revoked', revoked_at = ? WHERE device_id = ?
  AND status = 'active'` and returns `Promise<void>`

**Checkpoint**: DB helper exists and compiles cleanly.

---

## Phase 3: User Story 1 — Immediate Credential Invalidation (P1) MVP

**Goal**: When a device is revoked, all its active sessions are immediately
set to `status = 'revoked'`. Subsequent requests using those session tokens
are rejected with HTTP 401.

**Independent Test**: Revoke a device via `revokeRegisteredDevice`, then call
`getCurrentSession` with that device's session token — expect
`{ authenticated: false }`.

### Tests for User Story 1

- [ ] T003 [US1] Add integration test `revoke-then-session` to
  `test/integration.spec.ts`:
  1. Register user + device (mock-passkey pattern)
  2. Confirm email to activate user
  3. Register a second device (satisfies last-device guard)
  4. Insert session row for device 1 with `status = 'active'`
  5. Call `revokeRegisteredDevice(db, userId, deviceId1, deviceId2)`
  6. Call `getCurrentSession(db, sessionToken)` — assert
     `{ authenticated: false }`

### Implementation for User Story 1

- [ ] T004 [US1] Update `revokeRegisteredDevice` in
  `src/server/auth/index.ts` to call
  `revokeSessionsByDeviceId(db, deviceId, deps.now())` immediately after the
  `revokeDevice(db, deviceID)` call (depends on T002)

**Checkpoint**: US1 integration test passes — revoked device session is
rejected on next request.

---

## Phase 4: User Story 2 — Revocation Does Not Affect Other Devices (P2)

**Goal**: Revoking device A leaves device B's active sessions untouched.
Device B can continue to make authenticated requests after device A is revoked.

**Independent Test**: With two active devices, revoke device A, then confirm
device B's session token still returns `{ authenticated: true }`.

### Tests for User Story 2

- [ ] T005 [US2] Add integration test `revoke-one-not-other` to
  `test/integration.spec.ts`:
  1. Register user + device 1 + device 2
  2. Confirm email
  3. Insert active session rows for both device 1 and device 2
  4. Call `revokeRegisteredDevice(db, userId, deviceId1, deviceId2)`
  5. Call `getCurrentSession(db, sessionToken2)` — assert
     `{ authenticated: true }` (device 2 session unaffected)

**Checkpoint**: US1 and US2 both pass. Revocation is correctly scoped.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T006 [P] Verify `test/unit.spec.ts` still passes without modification
  (mock returns `run: () => Promise.resolve({ success: true })` for all
  prepared statements — new `UPDATE sessions` statement is already handled)
- [ ] T007 Run full test suite and lint: `npm test && npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks US1 impl
- **US1 (Phase 3)**: T003 (test) can be written in parallel with T002; T004
  depends on T002
- **US2 (Phase 4)**: Independent of US1 — can begin after Foundational (T002)
- **Polish (Phase 5)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Requires T002 (DB helper)
- **US2 (P2)**: Requires T002 (DB helper); independent of US1

### Parallel Opportunities

- T003 (US1 test skeleton) can be written while T002 is in progress
- T005 (US2 test) can be written in parallel with T003 and T004
- T006 and T007 are sequential final checks

---

## Parallel Example: After T002 Completes

```bash
# These can proceed in parallel once Foundational phase is done:
Task A: T003 — write US1 integration test in test/integration.spec.ts
Task B: T005 — write US2 integration test in test/integration.spec.ts
# Then:
Task A: T004 — update src/server/auth/index.ts
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: confirm baseline
2. Complete Phase 2: add `revokeSessionsByDeviceId` to `src/server/db/index.ts`
3. Complete Phase 3: write test + update `revokeRegisteredDevice`
4. **VALIDATE**: `npm test` — US1 integration test passes
5. Ship if sufficient

### Incremental Delivery

1. Phase 1 + 2 → DB helper ready
2. Phase 3 → US1 green (MVP)
3. Phase 4 → US2 green (correctness guarantee)
4. Phase 5 → clean pass on full suite

---

## Notes

- No new source files — all changes are in existing files
- No schema changes — `sessions.device_id` and `sessions.status` already exist
- Tests required: FR-005, SC-003, user request ("Need tests that cover this")
- Atomicity: two sequential UPDATEs (D1 does not support multi-statement
  transactions); if session UPDATE fails, device is still revoked and will be
  rejected on next passkey auth — acceptable per research Decision 1
