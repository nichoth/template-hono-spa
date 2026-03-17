# Data Model: Show Revoked Devices in Profile

## Entities

### Device (`devices` table — no schema changes)

| Field            | Type      | Notes                                    |
|------------------|-----------|------------------------------------------|
| `id`             | TEXT PK   | Device identifier                        |
| `user_id`        | TEXT FK   | References `users(id)`                   |
| `credential_id`  | TEXT      | Unique passkey credential ID             |
| `credential_name`| TEXT?     | Human-readable label                     |
| `created_at`     | INTEGER   | Unix ms timestamp                        |
| `last_used_at`   | INTEGER?  | Unix ms timestamp, nullable              |
| `is_revoked`     | INTEGER   | `0` = active, `1` = revoked (soft delete)|

**Key point**: Revoked devices remain in the DB. `is_revoked = 1` is the
only status transition. No new columns or migrations needed.

## State Transitions

```
active (is_revoked = 0)
    └── revokeDevice() → revoked (is_revoked = 1)
```

Revocation is one-way — there is no un-revoke operation.

## Client Type (`DeviceInfo` — no changes)

```ts
export type DeviceInfo = {
    deviceId:string;
    credentialId:string;
    credentialName:string | null;
    aaguid:string | null;
    transports:string[];
    createdAt:string;
    lastUsedAt:string | null;
    isRevoked:boolean;   // already present
}
```

The `isRevoked` field is already mapped by the server handler. No type
changes needed.
