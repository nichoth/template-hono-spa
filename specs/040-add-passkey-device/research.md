# Research: Add Passkey Device

## R1: Add-device WebAuthn ceremony for existing users

**Decision**: Create a new auth service method pair
(`startDeviceRegistration` / `finishDeviceRegistration`)
that reuses the existing `generateRegistrationOptions` and
`verifyRegistrationResponse` from @simplewebauthn/server but
skips user creation. The challenge record uses a new purpose
value `device_addition` to distinguish from initial signup.

**Rationale**: The existing `startRegistration` rejects
existing users by design (line 166-179 in auth/index.ts).
A separate method avoids complicating the signup flow and
makes the session-authentication requirement explicit.

**Alternatives considered**:
- Modifying `startRegistration` to accept existing users:
  rejected because it conflates signup and device addition,
  making session gating harder and risking regressions.
- Using the same `registration` challenge purpose: rejected
  because `finishRegistration` creates a user record; a
  distinct purpose prevents accidental user creation.

## R2: Session-gated endpoints

**Decision**: The add-device endpoints will read the session
cookie, call `getCurrentSession`, and reject unauthenticated
requests with 401. They also verify `login_method === 'passkey'`
and reject non-passkey accounts with 403.

**Rationale**: Follows the existing pattern where
`/api/session` reads the cookie. No middleware exists for
session enforcement, but inline checks are consistent with
the codebase style.

**Alternatives considered**:
- Hono middleware for auth: rejected as over-engineering
  for two endpoints; the project has no middleware pattern.

## R3: Device count enforcement

**Decision**: Add a `countActiveDevicesByUserId` DB helper
that returns the count of non-revoked devices. Check this
count before persisting a new device. Limit: 10.

**Rationale**: D1 supports `SELECT COUNT(*)` efficiently.
Checking before insert avoids orphaned challenge records.

**Alternatives considered**:
- Enforcing at the DB level with a trigger: rejected because
  D1 does not support triggers.

## R4: Last-device revocation protection

**Decision**: Before revoking a device, count active devices.
If count <= 1, reject with 409 and a clear message.

**Rationale**: Prevents account lockout. The existing
`revokeRegisteredDevice` method has no such guard.

**Alternatives considered**:
- Allowing revocation and forcing re-registration: rejected
  because the user would be locked out with no recovery path.

## R5: Client-side device management UI

**Decision**: Add a "Devices" section to the existing profile
route. Use the existing `ky` HTTP client and
`@preact/signals` pattern to fetch devices, render a list,
and provide "Add device" and "Revoke" actions.

**Rationale**: The profile page already shows account info
and is the natural home for device management. No new routes
needed.

**Alternatives considered**:
- Separate `/devices` route: rejected as unnecessary for a
  simple list + button UI that fits naturally in the profile.

## R6: Existing excludeCredentials during registration

**Decision**: When generating registration options for
add-device, pass the user's existing credential IDs in the
`excludeCredentials` option. This tells the browser to skip
authenticators that are already registered, preventing
duplicate credential errors at the WebAuthn level before
the server even checks.

**Rationale**: This is a WebAuthn best practice documented
in the spec. It improves UX by preventing the user from
re-registering the same authenticator.

**Alternatives considered**:
- Server-only duplicate check (current behavior): still
  needed as a fallback, but `excludeCredentials` provides
  a better UX.
