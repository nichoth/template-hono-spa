# Data Model: Device Invite Link

## New Entity: Device Invitation

Represents a pending request to register a new device on
an existing user's account.

### Fields

| Field          | Type    | Constraints                          |
|----------------|---------|--------------------------------------|
| id             | TEXT    | Primary key (UUID)                   |
| user_id        | TEXT    | NOT NULL, FK → users(id)             |
| invite_code    | TEXT    | NOT NULL, UNIQUE                     |
| device_name    | TEXT    | Nullable (optional label)            |
| status         | TEXT    | NOT NULL, DEFAULT 'pending'          |
| expires_at     | INTEGER | NOT NULL (Unix ms)                   |
| created_at     | INTEGER | NOT NULL (Unix ms)                   |
| consumed_at    | INTEGER | Nullable                             |

### Status Values

- `pending` — Created, waiting for new device to claim.
- `consumed` — New device successfully registered.
- `cancelled` — Original user cancelled the invitation.
- `expired` — Detected at read-time when
  `expires_at < now()`. Not explicitly written to DB
  (lazy expiration), but may be set explicitly if needed.

### Relationships

- Each invitation belongs to exactly one **User**
  (`user_id` → `users.id`).
- When consumed, the invitation results in a new
  **Device** record linked to the same user.
- The `invite_code` is the 6-digit numeric string used
  in the URL (e.g., `/:handle/add/:code`).

### State Transitions

```
                 ┌──────────┐
                 │ pending  │
                 └────┬─────┘
                      │
           ┌──────────┼──────────┐
           ▼          ▼          ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐
     │ consumed │ │cancelled │ │ expired  │
     └──────────┘ └──────────┘ └──────────┘
```

- `pending → consumed`: New device completes WebAuthn
  registration via the invitation URL.
- `pending → cancelled`: Original user clicks "Cancel"
  on their profile page.
- `pending → expired`: Invitation's `expires_at` has
  passed (checked at read-time).

### Constraints

- `invite_code` must be unique across all invitations
  (including expired/cancelled, to prevent code reuse
  within the collision window).
- Only one pending invitation per `invite_code` at a time
  (enforced by UNIQUE constraint).
- The existing 10-device-per-user limit applies. When
  generating an invitation, the system should count
  active devices + pending invitations against this limit.

## Existing Entity Changes

### Users

No schema changes. The `handle` field is already present
and used to construct the invitation URL
(`/:handle/add/:code`).

### Devices

No schema changes. A new device created via invitation
uses the same `devices` table. The `credential_name`
field stores the device name from the invitation.

## SQL Schema Addition

```sql
CREATE TABLE IF NOT EXISTS device_invitations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    invite_code TEXT NOT NULL UNIQUE,
    device_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    consumed_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
)
```
