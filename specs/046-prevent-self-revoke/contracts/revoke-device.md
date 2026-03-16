# Contract: Revoke Device Endpoint

**Endpoint**: `PATCH /api/auth/passkey/devices/:deviceId/revoke`

## Request

| Part | Value |
|------|-------|
| Method | `PATCH` |
| Auth | Session cookie (`auth_session`) required |
| Path param | `deviceId` — the ID of the device to revoke |
| Body | None |

## Responses

| Status | Condition | Body |
|--------|-----------|------|
| 204 | Device successfully revoked | None |
| 401 | No valid session | `{ error, message }` |
| 403 | Device does not belong to user | `{ error: "not_owner", message }` |
| 403 | Target device is the current session device | `{ error: "self_revoke", message }` ← NEW |
| 404 | Device not found | `{ error: "unknown_device", message }` |
| 409 | Target is the only active device | `{ error: "last_device", message }` |

## Change from Feature 045 Baseline

The `self_revoke` 403 response is new. Previously, revoking the
current device was allowed by the server (the client showed a dialog
warning instead). Now the server blocks it unconditionally.

## Validation Order

1. Authenticate session — 401 if missing/invalid
2. Look up device — 404 if not found
3. Ownership check — 403 `not_owner` if device belongs to another user
4. Self-revoke check — 403 `self_revoke` if target === session device
5. Last-device check — 409 `last_device` if only active device
6. Revoke — 204
