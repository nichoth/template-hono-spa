# Contract: Profile Devices API

## Endpoint

`GET /api/auth/passkey/devices`

## Purpose

Returns the registered devices visible to the currently authenticated user for rendering in the `/profile` Devices section.

## Authentication

- Requires a valid auth session cookie.
- If the request is unauthenticated, the endpoint returns `401`.

## Success Response

**Status**: `200 OK`

**Body**:

```json
[
  {
    "deviceId": "device_123",
    "credentialId": "cred_123",
    "credentialName": "My work laptop",
    "aaguid": null,
    "transports": ["internal"],
    "createdAt": "2026-03-19T18:30:00.000Z",
    "lastUsedAt": "2026-03-19T18:45:00.000Z",
    "isRevoked": false
  }
]
```

## Field Expectations

- `deviceId` is unique within the returned list and is used to match `currentDeviceId`.
- `credentialName` may be `null`.
- `lastUsedAt` may be `null`.
- `isRevoked` indicates whether the device is revoked but still visible.

## Error Response

**Status**: `401 Unauthorized`

**Body**:

```json
{
  "error": "unauthenticated",
  "message": "Session is required."
}
```

## Behavioral Guarantees

- The endpoint must only return devices owned by the authenticated user.
- The endpoint response shape remains stable for this feature.
- If the current session device is still visible, the response must contain the matching `deviceId` so the UI can mark it as the current device.
