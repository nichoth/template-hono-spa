# Data Model: Prevent Self-Revoke

**Date**: 2026-03-16

## Schema Changes

None. This feature requires no database schema changes.

The `device_id TEXT` column on the `sessions` table (added in feature
045) already supplies the current device identity needed for the
self-revoke guard.

## Relevant Existing Entities

### Session

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | Session identifier |
| `user_id` | TEXT | Foreign key to users |
| `device_id` | TEXT (nullable) | Device that created this session |

`device_id` is the value compared against the revoke target to detect
self-revocation.

### Device

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | Device identifier |
| `user_id` | TEXT | Foreign key to users |
| `is_revoked` | INTEGER | 0 = active, 1 = revoked |

No changes to this entity.

## Logic Changes (not schema)

### `revokeRegisteredDevice` (server auth service)

New parameter: `currentSessionDeviceId: string | null`

New validation (before existing checks):

```
if deviceID === currentSessionDeviceId:
  throw AuthError(403, 'self_revoke',
    'Cannot revoke the device you are currently using.')
```

Validation order (final):
1. Device exists (404)
2. Device belongs to user (403 `not_owner`)
3. Device is not the current session device (403 `self_revoke`) ← NEW
4. Not the last active device (409 `last_device`)
5. Revoke

### Revoke Endpoint (server)

Pass `session.currentDeviceId` (already available) as the new
`currentSessionDeviceId` argument to `revokeRegisteredDevice`.

### Profile UI (client)

`disabled` condition for revoke button changes from:

```
!canRevoke.value || revokePending.value === device.deviceId
```

to:

```
!canRevoke.value ||
device.deviceId === currentDeviceId.value ||
revokePending.value === device.deviceId
```

`title` attribute:

- If `!canRevoke.value`: "Cannot revoke your only device"
- If `device.deviceId === currentDeviceId.value`: "Cannot revoke
  the device you are currently using"
- Otherwise: "Revoke this device"

`onClick` handler: simplified — always calls `onRevokeDevice` directly.
The current device button is disabled so it will never fire for that
device.

Removed: `confirmRevokeDeviceId` signal, `ModalWindow` dialog block
for current-device confirmation.
