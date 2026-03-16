# Research: Prevent Self-Revoke

**Date**: 2026-03-16

## Current Behavior (Feature 045 baseline)

### Server

Endpoint: `PATCH /api/auth/passkey/devices/:deviceId/revoke`
(`src/server/index.ts:228-258`)

Handler:
1. Loads the active session from the cookie.
2. Calls `authService.revokeRegisteredDevice(db, session.user.id, deviceId)`.
3. `revokeRegisteredDevice` validates ownership and last-device guard, then
   sets `is_revoked = 1`.

The session object returned by `getCurrentSession()` includes
`currentDeviceId: string | null` (the `device_id` column from the
`sessions` table). This value is already available in the handler but
is not currently used in the revoke path.

### Client

`ProfileRoute` in `src/client/routes/profile.ts`:
- `currentDeviceId` signal (line 92): extracted from
  `state.user.value.data.currentDeviceId`.
- `canRevoke` signal (line 175): `true` when there are 2+ active devices.
- Revoke button `disabled` condition (line 297): `!canRevoke.value ||
  revokePending.value === device.deviceId`.
- For the current device (line 286-296): opens a confirmation dialog
  ("Revoking this device will end your session") instead of immediately
  revoking. The dialog then calls `onRevokeDevice`.

### Gap

The current device CAN be revoked:
- Client: dialog warns the user but does not block.
- Server: no check against `currentDeviceId`; the revoke succeeds.

---

## Decisions

### Decision 1: Where to add the server-side guard

**Decision**: Add the self-revoke check inside `revokeRegisteredDevice`
in `src/server/auth/index.ts`, not in the endpoint handler.

**Rationale**: Keeping validation logic in the auth service preserves
the single-responsibility boundary. If the endpoint handler is
ever replaced or a second endpoint is added, the guard travels
with the function.

**Implementation**: Add a `currentSessionDeviceId: string | null`
parameter to `revokeRegisteredDevice`. If `deviceID ===
currentSessionDeviceId`, throw `AuthError(403, 'self_revoke',
'Cannot revoke the device you are currently using.')`.

**Alternatives considered**:
- Check in the endpoint handler only — simpler but bypassed if a
  second code path is added.
- Check via a DB query — unnecessary; the value is already in memory.

---

### Decision 2: Client-side — disable vs. dialog

**Decision**: Disable the revoke button for the current device.
Remove the confirmation dialog path for current-device revocation.

**Rationale**: The spec requires the button to be disabled. The
confirmation dialog currently only warns but does not prevent. Removing
the dialog simplifies the code and eliminates the dead code path.

**Implementation**:
- Add `device.deviceId === currentDeviceId.value` to the `disabled`
  expression and the `ref` callback that manually sets the attribute.
- Update `title` to reflect the self-revoke reason when applicable.
- Simplify `onClick` to always call `onRevokeDevice` directly (no
  dialog branch). The current device button will never be clicked
  because it is disabled.
- Remove `confirmRevokeDeviceId` signal and the `<ModalWindow>`
  dialog block (used only for this path).

**Alternatives considered**:
- Keep the dialog but make it non-actionable — adds dead UI weight.
- Disable only in the UI and keep the dialog code — leaves unreachable
  code.

---

### Decision 3: Error code for self-revoke

**Decision**: Use HTTP 403 with error code `self_revoke`.

**Rationale**: Consistent with the existing `not_owner` 403 pattern.
The request is forbidden, not invalid input (400) or a conflict (409).

---

## Files to Change

| File | Change |
|------|--------|
| `src/server/auth/index.ts` | Add `currentSessionDeviceId` param + guard |
| `src/server/index.ts` | Pass `session.currentDeviceId` to the function |
| `src/client/routes/profile.ts` | Disable button; remove dialog path |
| `test/unit.spec.ts` | Add self-revoke rejection test |

No schema changes. No new dependencies.
