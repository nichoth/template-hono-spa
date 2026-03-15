# Quickstart: Add Passkey Device

## Overview

This feature adds the ability for authenticated passkey
users to register additional WebAuthn credentials, view
their device list, name devices, and revoke them. The
work spans three layers: DB helpers, auth service methods,
Hono routes, and client-side UI on the profile page.

## Implementation Order

### 1. DB helper: countActiveDevicesByUserId

Add to `src/server/db/index.ts`:

```ts
export async function countActiveDevicesByUserId (
    db:D1Database,
    userId:string,
):Promise<number> {
    const row = await db.prepare(
        'SELECT COUNT(*) as count FROM devices ' +
        'WHERE user_id = ? AND is_revoked = 0'
    ).bind(userId).first<{ count:number }>()
    return row?.count ?? 0
}
```

### 2. Auth service: startDeviceRegistration

Add to `src/server/auth/index.ts` inside
`createAuthService`:

- Accept `db`, `requestUrl`, `userId`, and optional
  `credentialName`
- Call `countActiveDevicesByUserId` -- reject if >= 10
- Call `listActiveDevicesByUserId` to build
  `excludeCredentials`
- Look up the user by ID to get identifier/displayName
- Call `generateRegistrationOptions` with the user's
  existing identity (not a new user ID)
- Create a challenge with purpose `'device_addition'`
  and metadata including `credentialName`
- Return `{ challengeReference, options }`

### 3. Auth service: finishDeviceRegistration

Add to `src/server/auth/index.ts` inside
`createAuthService`:

- Accept `db`, `requestUrl`, `userId`,
  `challengeReference`, `credential`, optional
  `credentialName`
- Find and validate the challenge (purpose must be
  `'device_addition'`)
- Verify the registration response
- Check for duplicate credential ID
- Re-check device count (race condition guard)
- Create the device record with `createDevice`
- Mark challenge used, log auth event
- Return `{ status, device }` with the new device info

### 4. Auth service: update revokeRegisteredDevice

Add last-device protection:

- Call `countActiveDevicesByUserId`
- If count <= 1, throw AuthError(409, 'last_device', ...)
- Also verify the device belongs to the given user

### 5. Hono routes

Add to `src/server/index.ts`:

- `POST /api/auth/passkey/devices/register/start`
  - Read session from cookie
  - Reject 401 if unauthenticated
  - Reject 403 if not passkey user
  - Call `startDeviceRegistration`

- `POST /api/auth/passkey/devices/register/finish`
  - Read session from cookie
  - Reject 401 if unauthenticated
  - Call `finishDeviceRegistration`

- Update `GET /api/auth/passkey/devices` to read user
  from session cookie instead of `userId` query param

- Update `PATCH .../revoke` to enforce ownership and
  last-device protection

### 6. Client state: addDevice action

Add to `src/client/state.ts`:

```ts
State.addDevice = async function (
    state:AppState,
    credentialName?:string,
) {
    // POST to /start, get options
    // Call beginBrowserRegistration
    // POST to /finish with credential + name
    // Return device info
}
```

### 7. Client UI: device management on profile

Add to `src/client/routes/profile.ts`:

- Fetch device list on mount (if passkey user)
- Render device list with name, dates
- "Add device" button triggers `State.addDevice`
- "Revoke" button per device (disabled if only 1 device)
- Show loading/error states using `@substrate-system/state`

## Key Files to Modify

| File | Changes |
| ---- | ------- |
| `src/server/db/index.ts` | Add `countActiveDevicesByUserId` |
| `src/server/auth/index.ts` | Add `startDeviceRegistration`, `finishDeviceRegistration`, update `revokeRegisteredDevice` |
| `src/server/index.ts` | Add 2 new routes, update 2 existing routes |
| `src/client/state.ts` | Add `State.addDevice`, `State.listDevices`, `State.revokeDevice` |
| `src/client/routes/profile.ts` | Add device management UI |
| `src/client/routes/profile.css` | Style device list |
| `test/integration.spec.ts` | Add device registration tests |

## Testing Strategy

- Unit tests for `countActiveDevicesByUserId`
- Integration tests for add-device ceremony (start + finish)
- Integration tests for last-device revocation protection
- Integration tests for 10-device limit enforcement
- Manual browser testing for the WebAuthn ceremony UI
