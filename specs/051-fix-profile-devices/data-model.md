# Data Model: Profile Device List Visibility

## Registered Device

**Purpose**: Represents a sign-in device that can be shown in the profile page’s Devices section.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `deviceId` | string | Yes | Stable device identifier used for rendering and actions |
| `credentialId` | string | Yes | Credential reference tied to the device |
| `credentialName` | string \| null | No | Human-readable device label; falls back to an unnamed label when missing |
| `aaguid` | string \| null | No | Authenticator metadata already exposed by the API |
| `transports` | string[] | Yes | Authenticator transport metadata |
| `createdAt` | ISO timestamp string | Yes | When the device was registered |
| `lastUsedAt` | ISO timestamp string \| null | No | Most recent use timestamp when available |
| `isRevoked` | boolean | Yes | Whether the device is revoked but still visible in the list |

**Validation rules**:

- Must belong to the authenticated user account.
- Must remain visible in the list even when revoked, unless broader product rules change outside this feature.
- The current device marker appears only when `deviceId` matches the authenticated session’s `currentDeviceId`.

## Authenticated Session

**Purpose**: Represents the signed-in user context that determines whether devices can be fetched and which device should be marked as current.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `authenticated` | boolean | Yes | Governs whether device APIs may be called |
| `user.id` | string | Yes | Owning user for device queries |
| `user.identifier` | string | Yes | Used elsewhere in profile display |
| `user.displayName` | string \| null | No | Profile metadata |
| `loginMethod` | string \| null | No | Determines whether device-management UI is shown |
| `session.expiresAt` | ISO timestamp string | Yes when authenticated | Session expiry metadata |
| `currentDeviceId` | string \| null | No | Identifies the current device in the rendered list |

**Validation rules**:

- Device loading should only occur once the session has resolved to an authenticated state that is eligible for device management.
- When `currentDeviceId` is present and a matching device exists, exactly one rendered device should carry the current-device marker.

## Device List View State

**Purpose**: Captures how the profile route should present the registered devices area while data is being loaded or after the request resolves.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `pending` | boolean | Yes | Indicates that device data is currently loading |
| `data` | Registered Device[] \| undefined | No | Present after a successful load |
| `error` | Error-like value \| null | No | Present when loading fails |

## Relationships

- One authenticated user can own many registered devices.
- One authenticated session can reference zero or one current device.
- The profile route derives its Devices section from `Authenticated Session` plus `Device List View State`.

## State Transitions

1. Session unresolved -> device list remains non-final and should not render as an empty success state.
2. Authenticated session resolved -> device list enters loading and requests registered devices.
3. Device request succeeds with one or more entries -> populated state renders the list and current-device marker when applicable.
4. Device request succeeds with zero entries -> explicit empty state renders.
5. Device request fails -> explicit error state renders.
