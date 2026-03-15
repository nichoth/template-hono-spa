# API Contract: Add Passkey Device

## POST /api/auth/passkey/devices/register/start

Start a WebAuthn registration ceremony for adding a new
device to an existing authenticated passkey account.

### Prerequisites

- Valid session cookie (`auth_session`)
- User `login_method` is `'passkey'`
- User has fewer than 10 active devices

### Request

```json
{
    "credentialName": "Work Laptop"
}
```

`credentialName` is optional. If omitted, a default name
is assigned (e.g. "Device 3").

### Response 200

```json
{
    "challengeReference": "<uuid>",
    "options": {
        "rp": { "name": "Template Hono SPA", "id": "..." },
        "user": { "id": "...", "name": "...", "displayName": "..." },
        "challenge": "...",
        "pubKeyCredParams": [...],
        "timeout": 300000,
        "excludeCredentials": [
            { "id": "...", "transports": ["internal"] }
        ],
        "authenticatorSelection": {
            "residentKey": "preferred",
            "userVerification": "preferred"
        }
    }
}
```

### Error Responses

| Status | Code | Message |
| ------ | ---- | ------- |
| 401 | unauthenticated | Session is required. |
| 403 | not_passkey_user | Only passkey accounts can add devices. |
| 409 | device_limit | Maximum of 10 devices reached. |

---

## POST /api/auth/passkey/devices/register/finish

Complete the WebAuthn registration ceremony and persist
the new device.

### Request

```json
{
    "challengeReference": "<uuid>",
    "credential": { ... },
    "credentialName": "Work Laptop"
}
```

`credential` is the `RegistrationResponseJSON` from
`@simplewebauthn/browser`. `credentialName` is optional
(can also be provided at start).

### Response 200

```json
{
    "status": "device_added",
    "device": {
        "deviceId": "<uuid>",
        "credentialName": "Work Laptop",
        "createdAt": "2026-03-14T..."
    }
}
```

### Error Responses

| Status | Code | Message |
| ------ | ---- | ------- |
| 400 | invalid_challenge | Challenge was not found. |
| 400 | invalid_challenge_state | Challenge can no longer be used. |
| 400 | expired_challenge | Challenge has expired. |
| 400 | registration_failed | Passkey could not be verified. |
| 401 | unauthenticated | Session is required. |
| 409 | credential_exists | That passkey is already registered. |
| 409 | device_limit | Maximum of 10 devices reached. |

---

## GET /api/auth/passkey/devices (existing, no changes)

List all devices for the authenticated user. Currently
takes `userId` as a query param. Will be updated to read
user ID from the session cookie instead, removing the need
for the client to pass it explicitly.

### Response 200

```json
[
    {
        "deviceId": "<uuid>",
        "credentialId": "...",
        "credentialName": "iPhone 15",
        "aaguid": "...",
        "transports": ["internal"],
        "createdAt": "2026-03-14T...",
        "lastUsedAt": "2026-03-14T...",
        "isRevoked": false
    }
]
```

---

## PATCH /api/auth/passkey/devices/:deviceId/revoke (existing, updated)

Revoke a registered device. Will be updated to:
1. Read user from session cookie
2. Verify the device belongs to the authenticated user
3. Reject if it's the user's last active device

### Response 204

No body.

### Error Responses (new)

| Status | Code | Message |
| ------ | ---- | ------- |
| 401 | unauthenticated | Session is required. |
| 403 | not_owner | Device does not belong to your account. |
| 409 | last_device | Cannot revoke your only active device. |
