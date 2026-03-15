# Contract: Device Invitation API

## POST /api/auth/passkey/devices/invite

**Purpose**: Create a device invitation (generates a short
code and returns the invitation URL).

**Auth**: Requires valid session cookie. User must have
`login_method = 'passkey'`.

### Request

```json
{
    "deviceName": "Work Laptop"
}
```

- `deviceName` (string, optional): Human-readable label
  for the new device. Stored in the invitation and copied
  to the device record upon registration.

### Response (200)

```json
{
    "status": "invitation_created",
    "inviteCode": "482901",
    "inviteUrl": "/my-handle/add/482901",
    "deviceName": "Work Laptop",
    "expiresAt": "2026-03-14T19:15:00.000Z"
}
```

### Error Responses

| Status | Code               | When                              |
|--------|--------------------|-----------------------------------|
| 401    | unauthenticated    | No valid session                  |
| 403    | not_passkey_user   | User's login_method != 'passkey'  |
| 409    | device_limit       | Active devices + pending          |
|        |                    | invitations >= 10                 |

---

## DELETE /api/auth/passkey/devices/invite/:inviteCode

**Purpose**: Cancel a pending invitation.

**Auth**: Requires valid session cookie. User must own
the invitation.

### Response (204)

No body.

### Error Responses

| Status | Code              | When                               |
|--------|-------------------|-------------------------------------|
| 401    | unauthenticated   | No valid session                    |
| 403    | not_owner         | Invitation belongs to another user  |
| 404    | unknown_invite    | Invitation not found                |
| 409    | already_consumed  | Invitation already used             |

---

## GET /api/auth/passkey/devices/invites

**Purpose**: List pending invitations for the current user.

**Auth**: Requires valid session cookie.

### Response (200)

```json
[
    {
        "inviteCode": "482901",
        "deviceName": "Work Laptop",
        "status": "pending",
        "expiresAt": "2026-03-14T19:15:00.000Z",
        "createdAt": "2026-03-14T19:00:00.000Z"
    }
]
```

Only returns invitations with status `pending` and
`expires_at > now()`.

---

## GET /:handle/add/:code

**Purpose**: Serve the SPA shell. The client-side route
renders the invitation claim page.

**Auth**: None required (the invite code is the
authorization).

**Server behavior**: The Hono catch-all `GET *` handler
already serves the SPA shell for non-asset paths, so this
route does not need a dedicated server handler. The client
router matches the pattern and renders the claim UI.

---

## POST /api/auth/passkey/devices/invite/:code/claim/start

**Purpose**: Validate the invitation and generate WebAuthn
registration options for the new device.

**Auth**: None (invitation code is the authorization).

### Request

No body required. The invite code is in the URL.

### Response (200)

```json
{
    "challengeReference": "challenge-id-uuid",
    "options": { ... },
    "deviceName": "Work Laptop",
    "handle": "my-handle"
}
```

- `options`: Standard WebAuthn
  `PublicKeyCredentialCreationOptionsJSON`.
- `deviceName`: Echoed back so the UI can display it.
- `handle`: Echoed back for display context.

### Error Responses

| Status | Code              | When                              |
|--------|-------------------|-----------------------------------|
| 404    | unknown_invite    | Invitation not found              |
| 410    | invite_expired    | Invitation has expired            |
| 409    | already_consumed  | Invitation already used           |

---

## POST /api/auth/passkey/devices/invite/:code/claim/finish

**Purpose**: Complete the WebAuthn registration and save
the new device.

**Auth**: None (invitation code + challenge reference is
the authorization).

### Request

```json
{
    "challengeReference": "challenge-id-uuid",
    "credential": { ... }
}
```

- `credential`: Standard WebAuthn
  `RegistrationResponseJSON` from the browser.

### Response (200)

```json
{
    "status": "device_added",
    "device": {
        "deviceId": "uuid",
        "credentialName": "Work Laptop",
        "createdAt": "2026-03-14T19:02:00.000Z"
    }
}
```

### Error Responses

| Status | Code               | When                             |
|--------|--------------------|----------------------------------|
| 404    | unknown_invite     | Invitation not found             |
| 410    | invite_expired     | Invitation expired               |
| 409    | already_consumed   | Invitation already used          |
| 400    | verification_failed| WebAuthn verification failed     |
| 409    | device_limit       | Race condition: limit reached    |
|        |                    | between start and finish         |
