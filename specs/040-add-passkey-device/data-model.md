# Data Model: Add Passkey Device

## Existing Entities (no schema changes)

### users

The `users` table already supports a 1-to-many relationship
with devices. Each user has a stable UUID primary key and
a `login_method` field that distinguishes passkey users.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | TEXT PK | UUID |
| handle | TEXT | Random user handle |
| identifier | TEXT UNIQUE | Email |
| display_name | TEXT | Optional |
| login_method | TEXT | 'passkey' or 'password' |
| status | TEXT | 'active' or 'pending' |
| created_at | INTEGER | Epoch ms |
| updated_at | INTEGER | Epoch ms |

### devices

Each device stores exactly one passkey credential. The
`user_id` foreign key establishes the 1-to-many
relationship. During login, the server receives credential
material, looks up the device by `credential_id`, then
resolves the owning user via `user_id`.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | TEXT PK | UUID |
| user_id | TEXT FK | References users.id, CASCADE |
| credential_id | TEXT UNIQUE | WebAuthn credential ID |
| public_key | TEXT | Base64url-encoded |
| counter | INTEGER | Signature counter |
| transports_json | TEXT | JSON array of transports |
| aaguid | TEXT | Authenticator type ID |
| credential_name | TEXT | User-facing friendly name |
| created_at | INTEGER | Epoch ms |
| last_used_at | INTEGER | Epoch ms, nullable |
| is_revoked | INTEGER | 0 or 1 |

### auth_challenges

Reused for the add-device ceremony with a new `purpose`
value.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | TEXT PK | UUID (challenge reference) |
| user_id | TEXT | Set for add-device challenges |
| identifier | TEXT | User's email |
| purpose | TEXT | 'device_addition' (new value) |
| challenge_value | TEXT | WebAuthn challenge |
| status | TEXT | 'pending', 'used', 'expired' |
| expires_at | INTEGER | Epoch ms |
| created_at | INTEGER | Epoch ms |
| used_at | INTEGER | Nullable |
| metadata_json | TEXT | JSON with credentialName |

## New DB Helper

### countActiveDevicesByUserId

```sql
SELECT COUNT(*) as count
FROM devices
WHERE user_id = ?
AND is_revoked = 0
```

Returns the number of active (non-revoked) devices for a
user. Used to enforce the 10-device maximum and to prevent
revoking the last active device.

## Relationship Summary

```
users (1) ---> (many) devices
  |                      |
  | user_id FK           | credential_id UNIQUE
  |                      |
  +--- login flow: server receives credential_id
       -> looks up device row
       -> resolves user via device.user_id
```

No schema migrations required. All tables already exist.
