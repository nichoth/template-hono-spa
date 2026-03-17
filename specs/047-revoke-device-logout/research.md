# Research: Immediate Device Logout on Revocation

## Gap Analysis

### Why sessions survive device revocation today

`revokeRegisteredDevice` (auth/index.ts:649) calls `revokeDevice(db, deviceID)`
which executes:

```sql
UPDATE devices SET is_revoked = 1 WHERE id = ?
```

`getCurrentSession` (auth/index.ts:581) then looks up the session by token and
checks only:

1. `session.status !== 'active'` — returns unauthenticated
2. `session.user_status !== 'active'` — revokes and returns unauthenticated
3. `session.expires_at <= now` — expires and returns unauthenticated

It does **not** check whether the device linked to that session
(`session.device_id`) still has `is_revoked = 0`. So a revoked device's
session token remains accepted until the 30-day TTL expires.

---

## Decisions

### Decision 1: Revoke sessions at revocation time (not at check time)

**Decision**: Add `revokeSessionsByDeviceId(db, deviceId, now)` to
`src/server/db/index.ts` and call it from `revokeRegisteredDevice` immediately
after `revokeDevice`.

**Rationale**:
- Consistent with existing revocation pattern — `revokeSession` already sets
  `status = 'revoked'` and `revoked_at = ?`.
- No per-request overhead — `getCurrentSession` gains no new DB queries.
- Atomic with the device revocation at the application level (D1 does not
  support multi-statement transactions in the binding, so we run two sequential
  `UPDATE` statements; failure of the second leaves the device revoked but
  session alive — acceptable since the device will still be rejected on the
  next passkey auth attempt).

**Alternatives considered**:

| Option | Description | Rejected because |
|--------|-------------|-----------------|
| Check `device.is_revoked` in `getCurrentSession` | Join/extra query per request | Adds latency on every authenticated request, not just at revocation |
| Delete device row on revocation | Remove credential entirely | Would break `findDeviceByCredentialId` audit trail and future analytics |
| Cascade revoke via SQL trigger | DB-level cascade | D1 doesn't support triggers |

---

### Decision 2: SQL for `revokeSessionsByDeviceId`

```sql
UPDATE sessions
SET status = 'revoked', revoked_at = ?
WHERE device_id = ? AND status = 'active'
```

Only revokes currently `active` sessions for that device. Sessions already
`revoked` or `expired` are unaffected, avoiding unnecessary writes.

---

### Decision 3: No `now` threading change in public API

`revokeRegisteredDevice` currently does not accept a `now` parameter. It will
use `deps.now()` (already injected) for the revocation timestamp — matching
the pattern used throughout the auth service.

---

## Test Approach

**Integration test** (preferred — hits real D1 via
`@cloudflare/vitest-pool-workers`):

1. Register a user + device using the existing mock-passkey pattern.
2. Confirm email to activate the user.
3. Create a second device so that revocation of device 1 is permitted (avoids
   `last_device` guard).
4. Manually insert a session row for device 1 with `status = 'active'`.
5. Call `revokeRegisteredDevice(db, userId, deviceId1, deviceId2)`.
6. Call `getCurrentSession(db, sessionToken)` — expect
   `{ authenticated: false }`.

**Unit test update**: The existing mock-db `revokeRegisteredDevice` unit test
(`unit.spec.ts:1009`) will need its mock to also handle the new
`UPDATE sessions … WHERE device_id = ?` statement, so `run()` resolves
without throwing.

The mock already returns `run: () => Promise.resolve({ success: true })`
for all prepared statements, so no change to the mock is required. The
existing unit tests should continue to pass without modification.
