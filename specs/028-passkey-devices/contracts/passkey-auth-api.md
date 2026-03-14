# Contracts: Passkey authentication API

## POST /api/auth/passkey/register

- **Purpose**: Persist a new user and the associated device credential when a WebAuthn registration ceremony completes.
- **Request Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "challenge": "...",
    "credential": {
      "id": "base64url-id",
      "publicKey": "base64url-key",
      "transports": ["usb", "internal"],
      "aaguid": "aaguid-string",
      "name": "iPhone 15"
    }
  }
  ```
- **Response**: `200 OK` with `{ "userId": "<UUID>", "deviceId": "<UUID>" }` plus the stored handle.
  - If the `credential.id` already exists, return `409 Conflict`.

## POST /api/auth/passkey/login

- **Purpose**: Verify an existing credential and return the owning user record.
- **Request Body** (JSON):
  ```json
  {
    "credentialId": "base64url-id",
    "challenge": "...",
    "signature": "base64url-signature"
  }
  ```
- **Response**: `200 OK` with `{ "user": { "id": "<UUID>", "email": "...", "handle": "..." } }`.
  - Authentication fails if the credential is revoked, missing, or the counter/signature are invalid (`401 Unauthorized`).

## GET /api/auth/passkey/devices?userId=<UUID>

- **Purpose**: List every device tied to a user for audit/admin flows.
- **Response**: `200 OK` with an array sorted by `last_used_at` descending:
  ```json
  [
    {
      "deviceId": "<UUID>",
      "credentialId": "base64url-id",
      "credentialName": "iPhone 15",
      "aaguid": "...",
      "transports": ["internal"],
      "lastUsedAt": "...",
      "isRevoked": false
    }
  ]
  ```

## PATCH /api/auth/passkey/devices/:deviceId/revoke

- **Purpose**: Mark a device as revoked (or delete it, depending on implementation) so its credential can no longer authenticate.
- **Response**: `204 No Content` when the row is updated. Further login attempts with the credential return `401 Unauthorized`.

These contracts ensure every device action touches the `devices` table and references the owning `users` row before responding.
