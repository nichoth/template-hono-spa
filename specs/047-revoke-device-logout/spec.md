# Feature Specification: Immediate Device Logout on Revocation

**Feature Branch**: `047-revoke-device-logout`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "This is important -- I want any existing devices that are
logged in, to be logged out as soon as I revoke the device in the GUI. If I
revoke a device, the next request made by that device should fail because its
credentials are no longer in the DB. Need tests that cover this."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Immediate Credential Invalidation (Priority: P1)

An administrator revokes a device through the device management GUI. The
moment the revocation is confirmed, that device's credentials are permanently
removed from the system. Any subsequent request made by the revoked device is
rejected immediately — the device cannot continue using the application until
re-invited and re-authenticated.

**Why this priority**: This is the core security requirement. Without immediate
invalidation, revoked devices retain access indefinitely until their session
naturally expires, creating a window where a compromised or decommissioned
device can still act on behalf of a user.

**Independent Test**: Can be fully tested by (1) revoking a device via the GUI
or API, then (2) attempting an authenticated request with that device's
credentials, and verifying the request is rejected with an authentication
error.

**Acceptance Scenarios**:

1. **Given** a device is active and authenticated, **When** an administrator
   revokes it via the GUI, **Then** the device's credentials are removed from
   the database within the same operation.
2. **Given** a device has just been revoked, **When** that device makes any
   authenticated request, **Then** the system rejects the request with an
   authentication failure (HTTP 401) and does not process the request.
3. **Given** a device has been revoked, **When** that device attempts to
   re-use previously valid credentials, **Then** the system continues to
   reject all requests regardless of how recently the credentials were valid.

---

### User Story 2 - Revocation Does Not Affect Other Devices (Priority: P2)

When one device is revoked, all other devices belonging to the same account
continue to operate normally without interruption.

**Why this priority**: Ensures revocation is scoped correctly — a targeted
security action against one device must not inadvertently disrupt legitimate
sessions on other devices.

**Independent Test**: Can be fully tested by revoking device A while device B
is active, then confirming device B can still make authenticated requests.

**Acceptance Scenarios**:

1. **Given** two devices are active, **When** one device is revoked, **Then**
   the other device's subsequent requests succeed normally.

---

### Edge Cases

- What happens if a device makes a request at the exact moment it is being
  revoked? The revocation operation must complete atomically; the in-flight
  request may succeed or fail, but no subsequent requests from that device
  should succeed.
- What happens if an administrator attempts to revoke an already-revoked
  device? The system should handle this gracefully without error.
- What happens if the revoked device is later re-invited? A new invitation
  generates fresh credentials; the old revoked credentials remain invalid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a device is revoked, the system MUST delete that device's
  stored credentials from the database as part of the revocation operation.
- **FR-002**: The system MUST reject any authenticated request made by a
  device whose credentials are no longer present in the database, returning
  an HTTP 401 response.
- **FR-003**: Credential invalidation MUST occur synchronously with the
  revocation action — there must be no grace period or delay.
- **FR-004**: Revocation of one device MUST NOT affect the credentials or
  active sessions of any other device.
- **FR-005**: The system MUST include automated tests that verify a revoked
  device cannot successfully make authenticated requests after revocation.

### Key Entities

- **Device**: A registered client with associated credentials. Can be in
  active or revoked state. Identified by a stable identifier.
- **Credentials**: The authentication secret associated with a device, stored
  in the database. Presence of valid credentials in the DB is the sole
  determinant of access.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authenticated requests made by a revoked device are
  rejected — zero requests succeed after revocation.
- **SC-002**: Credential removal occurs within the same transaction as the
  revocation action — no window exists where a device is "revoked" but
  credentials still persist.
- **SC-003**: Automated test suite includes at least one end-to-end test
  covering the revoke-then-request flow and it passes consistently.
- **SC-004**: Revocation of one device does not cause any test failures
  related to other devices' authentication.

## Assumptions

- Authentication is credential-based and checked against the database on
  every request — there is no client-side token (e.g., JWT) that could
  remain valid after DB removal.
- The GUI revocation action maps to a single server-side revoke endpoint that
  is responsible for the deletion.
- No additional session store (cache, Redis, etc.) exists that would need to
  be invalidated separately.
