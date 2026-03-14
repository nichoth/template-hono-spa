# Feature Specification: Passkey device backend

**Feature Branch**: `028-passkey-devices`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "I would like to add provisions for passwordless login + multiple devices per user."

## Clarifications

### Session 2026-03-14

- Q: Should passkey logins follow the same Hono-managed session cookie flow as the existing login endpoints? → A: Yes, keep using `AUTH_SESSION_COOKIE` so Hono manages sessions via cookies just like `/api/auth/login/finish`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register passkey-enabled device (Priority: P1)

When a sign-up flow completes a WebAuthn registration ceremony, the backend must persist a UUID-backed user row plus the first device record so that the passkey can be used for later logins.

**Why this priority**: This step enables the passwordless onboarding path; without it no device can authenticate.

**Independent Test**: Trigger the registration flow and assert that both `users` and `devices` tables contain the expected rows with credential metadata.

**Acceptance Scenarios**:

1. **Given** an unregistered email, **When** the registration response is received, **Then** the system writes a user row (UUID, handle, email snapshot) and a device row tied to that user including credential ID, public key, transports, AAGUID, name, and timestamps.
2. **Given** an existing user, **When** a second device registers, **Then** the new device row is created with the same `user_id`, leaving prior rows untouched.

---

### User Story 2 - Authenticate via existing passkey (Priority: P1)

Users must be able to log in from any registered device by verifying the signed challenge with the stored public key and safely updating the counter.

**Why this priority**: This is the core user value of passwordless login across multiple devices.

**Independent Test**: Simulate a login attempt referencing a known credential ID and assert that verification uses the stored public key and increments the counter.

**Acceptance Scenarios**:

1. **Given** a valid device row, **When** the authenticator signs the challenge, **Then** the system verifies the signature with the stored public key and updates the counter to the new value.
2. **Given** a credential ID that is revoked or not linked to the user, **When** the login attempt arrives, **Then** authentication fails before the counter changes.

3. **Given** a successful passkey authentication, **When** the response is returned, **Then** the service sets the same Hono-managed `AUTH_SESSION_COOKIE` used by the legacy login flow so session handling stays consistent.

---

### User Story 3 - Revoke lost devices (Priority: P2)

Administrators (or automation) must be able to mark a registered device as revoked or delete it so that credential IDs no longer authenticate.

**Why this priority**: Device lifecycle control is required to keep multi-device accounts secure.

**Independent Test**: Revoke a device row and assert that subsequent authentication attempts with that credential ID fail immediately.

**Acceptance Scenarios**:

1. **Given** a revoked device row, **When** a signature arrives for that credential ID, **Then** the system rejects it before verifying the signature.

---

### Edge Cases

- Duplicate credential IDs must be rejected at insert time so that the integrity of `credential_id` remains intact.
- Counter updates from offline authenticators must be monotonic; a replay with a lower counter must be rejected, but heartbeats that advance the counter can succeed.
- If the user record is deleted, all linked devices should be removed by cascade while preserving the ability to resurrect the schema for audit purposes.

## Assumptions

- The feature targets backend-only work; no user-facing interface is required in this phase.
- WebAuthn challenge generation and signature verification are handled elsewhere, so this spec focuses on persistence and counter management.
- Device metadata such as credential name and AAGUID is supplied by the client during registration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist passkey account data in a `users` table that contains a stable UUID primary key, random user handle, email snapshot, and creation timestamp.
- **FR-002**: System MUST introduce a `devices` table with a foreign key to `users.id`, columns for `credential_id`, `public_key`, `counter`, `transports`, `aaguid`, `credential_name`, `created_at`, `last_used_at`, and a revocation flag.
- **FR-003**: Device registration MUST store all WebAuthn metadata (credential ID, public key, transports, AAGUID, timestamps) and reject duplicate `credential_id` values.
- **FR-004**: Login verification MUST find the device for the given credential ID, validate the challenge signature with the stored public key, and atomically bump the counter if the signature is valid and the counter is higher.
- **FR-005**: Revoking or deleting a device record MUST immediately block authentication attempts that reference its credential ID while keeping other devices functional.
- **FR-006**: Schema migrations MUST ensure cascading deletes from `users` to `devices` but also permit marking devices as inactive rather than removing them.
- **FR-007**: The backend MUST allow querying all active and revoked devices for a user, ordered by `last_used_at`, to support future auditing and admin actions.

### Key Entities *(include if feature involves data)*

- **Users**: Represents the account owner and stores the UUID, user handle, email snapshot, and creation timestamp; serves as the parent for devices.
- **Devices**: Represents a WebAuthn credential tied to a user; stores credential ID, public key, counter, transports, AAGUID, metadata (credential name), timestamps, and revocation status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Provisioning a new passkey device results in both a user row and a device row populated within one registration attempt, as confirmed by automated tests.
- **SC-002**: 99% of authentication attempts that present valid credential IDs succeed after counter verification in synthetic tests (simulating up to 20 devices per user).
- **SC-003**: Every revoked device fails authentication immediately in replay tests while other devices continue to succeed.
- **SC-004**: Admin queries return the list of up to 100 devices for a user sorted by `last_used_at` within one second in benchmark tests.
