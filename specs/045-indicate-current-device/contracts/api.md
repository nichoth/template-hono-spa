# API Contract Changes: Indicate Current Device

## GET /api/session

**Change**: Response body gains `currentDeviceId` in the authenticated branch.

### Response — authenticated passkey session

```json
{
    "authenticated": true,
    "user": {
        "id": "...",
        "identifier": "user@example.com",
        "displayName": "...",
        "login_method": "passkey"
    },
    "session": {
        "expiresAt": "2026-04-15T12:00:00.000Z"
    },
    "loginMethod": "passkey",
    "currentDeviceId": "device-uuid-here"
}
```

### Response — password session or legacy session without device_id

```json
{
    "authenticated": true,
    ...
    "loginMethod": "password",
    "currentDeviceId": null
}
```

### Response — unauthenticated (unchanged)

```json
{ "authenticated": false }
```

**Backward compatibility**: `currentDeviceId` is a new additive field.
No existing fields are removed or renamed.

## POST /api/auth/passkey/authentication/finish

**Change**: Response also includes `currentDeviceId` set to the device
used to authenticate, so the client knows immediately after login without
a follow-up session fetch.

## No other endpoint changes

The revoke endpoint (`PATCH /api/auth/passkey/devices/:deviceId/revoke`)
is unchanged. The confirmation dialog is a pure client-side gate.
