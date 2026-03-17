# Data Model: Immediate Device Logout on Revocation

No schema changes are required. This feature uses existing columns.

## Relevant Entities

### Device (`devices` table)

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | Stable device identifier |
| `user_id` | TEXT FK | Owner |
| `credential_id` | TEXT UNIQUE | WebAuthn credential |
| `is_revoked` | INTEGER | 0 = active, 1 = revoked |

**Revocation sets `is_revoked = 1`.**

### Session (`sessions` table)

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | |
| `user_id` | TEXT FK | |
| `session_token` | TEXT UNIQUE | Cookie value |
| `status` | TEXT | `'active'`, `'revoked'`, `'expired'` |
| `device_id` | TEXT nullable | Links session to the device that created it |
| `revoked_at` | INTEGER nullable | Unix ms timestamp of revocation |

**New behavior**: when a device is revoked, all sessions where
`device_id = <revoked device id> AND status = 'active'` are updated to
`status = 'revoked'` with `revoked_at = <now>`.

## State Transition

```
Device active  →  revokeRegisteredDevice()  →  Device is_revoked = 1
                                             →  Sessions for device: status = 'revoked'

Session status:  active  →  revoked
                             ↓
                   getCurrentSession() returns { authenticated: false }
```

## New DB Function

```typescript
// src/server/db/index.ts
export async function revokeSessionsByDeviceId (
    db:D1Database,
    deviceId:string,
    now:number,
):Promise<void>
```

SQL:
```sql
UPDATE sessions
SET status = 'revoked', revoked_at = ?
WHERE device_id = ? AND status = 'active'
```
