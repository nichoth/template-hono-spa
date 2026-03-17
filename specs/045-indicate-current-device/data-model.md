# Data Model: Indicate Current Device

## Entity: Session (updated)

**Table**: `sessions`

| Field         | Type         | Notes                                 |
|---------------|--------------|---------------------------------------|
| id            | TEXT PK      | UUID                                  |
| user_id       | TEXT FK      | → users.id                            |
| session_token | TEXT UNIQUE  | High-entropy token stored in cookie   |
| status        | TEXT         | 'active' | 'revoked' | 'expired'      |
| created_at    | INTEGER      | Unix ms                               |
| expires_at    | INTEGER      | Unix ms                               |
| revoked_at    | INTEGER?     | Unix ms, nullable                     |
| last_seen_at  | INTEGER      | Unix ms, updated on each request      |
| **device_id** | **TEXT?**    | **NEW: FK → devices.id, nullable**    |

**Migration**: `ALTER TABLE sessions ADD COLUMN device_id TEXT`
Nullable; existing sessions get NULL → no current-device label shown.

## Validation Rules

- `device_id` is nullable. NULL means "device unknown" — label is absent.
- Populated only for passkey sessions (via `finishAuthentication`).
  Password sessions remain NULL.
- If the referenced device is later revoked, it is filtered from
  `activeDevices` before render, so the label is naturally absent.

## State Transitions

The `device_id` is write-once at session creation. No updates needed.

## TypeScript Changes

```ts
// src/server/db/index.ts — SessionRecord
export type SessionRecord = {
    id:string;
    user_id:string;
    session_token:string;
    status:string;
    created_at:number;
    expires_at:number;
    revoked_at:number | null;
    last_seen_at:number;
    device_id:string | null;   // NEW
}

// src/server/auth/index.ts — SessionResponse authenticated branch
{
    authenticated:true;
    user:AuthUser;
    session:SessionSummary;
    loginMethod:'passkey'|'password' | null;
    currentDeviceId:string | null;   // NEW
}

// src/client/state.ts — same addition to client copy of SessionResponse
```

## UI State (profile.ts signals)

| Signal | Type | Purpose |
|--------|------|---------|
| `confirmRevokeDeviceId` | `Signal<string \| null>` | ID of device pending confirmation; null = dialog closed |

No new server-side state; dialog is purely client-side.
