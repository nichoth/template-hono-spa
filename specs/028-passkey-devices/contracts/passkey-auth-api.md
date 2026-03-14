# Contracts: Passkey authentication API

## POST /api/auth/passkey/register

- **Purpose**: Complete the WebAuthn registration ceremony and persist the new user plus its device record.
- **Request Body** (JSON):
  ```json
  {
    "challengeReference": "<challenge-id>",
    "credential": { /* full RegistrationResponseJSON from the client */ }
  }
  ```
- **Response**: `200 OK` with the `RegistrationConfirmationResponse` payload that includes `userId`, `deviceId`, and the generated handle.
  - Duplicate identifiers or credential IDs return `409 Conflict`.

## POST /api/auth/passkey/login

- **Purpose**: Verify a passkey assertion, update the device counter, and return the authenticated session.
- **Request Body** (JSON):
  ```json
  {
    "challengeReference": "<challenge-id>",
    "credential": { /* full AuthenticationResponseJSON from the client */ }
  }
  ```
- **Response**: `200 OK` with the same session payload as `/api/auth/login/finish`, including the authenticated user object.
  - Missing, revoked, or invalid credentials return `401 Unauthorized`.

## GET /api/auth/passkey/devices?userId=<UUID>

- **Purpose**: List every device tied to a user for audits and automation.
- **Response**: `200 OK` with an array sorted by `lastUsedAt` descending:
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

- **Purpose**: Mark a device as revoked so its credential no longer authenticates.
- **Response**: `204 No Content`; subsequent login attempts with that credential return `401 Unauthorized`.

These contracts ensure every device action touches the `devices` table and references the owning `users` row before responding.
