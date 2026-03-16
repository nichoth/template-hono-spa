# Feature Specification: Prevent Self-Revoke

**Feature Branch**: `046-prevent-self-revoke`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "Make it impossible to revoke the device
you are currently using. The UI revoke button should be disabled for
the current device, and the server should reject revoke requests from
the device being revoked."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Revoke Button Disabled for Current Device (Priority: P1)

A logged-in user views their list of registered devices on their
profile page. The device they are currently using has its "Revoke"
button visually disabled and non-interactive, preventing accidental
self-lockout.

**Why this priority**: This is the primary user-facing protection.
Without it, users can click "Revoke" on their active device and
immediately lose access to their account with no warning or recovery
path.

**Independent Test**: Navigate to the device management page while
authenticated. Confirm the current device's revoke button is disabled
and all other devices' revoke buttons remain enabled.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and views their device list,
   **When** the page loads, **Then** the "Revoke" button for the
   device matching the current session is visually disabled and
   cannot be clicked.

2. **Given** a user has two registered devices, **When** they view
   the device list from device A, **Then** device A's revoke button
   is disabled and device B's revoke button is enabled.

3. **Given** a user has only one registered device (the current one),
   **When** they view the device list, **Then** the sole device's
   revoke button is disabled.

---

### User Story 2 - Server Rejects Self-Revoke Requests (Priority: P2)

Even if a user bypasses the disabled UI button (e.g., via a direct
request or browser devtools), the server refuses to revoke the device
that made the request.

**Why this priority**: Defense in depth. The client-side guard alone
is insufficient — the server must enforce the same constraint to
prevent circumvention. This is a security requirement.

**Independent Test**: Submit a revoke request for the authenticated
device's own identifier directly to the server. Confirm the server
returns an error and the device remains active.

**Acceptance Scenarios**:

1. **Given** a device is authenticated, **When** a revoke request is
   submitted targeting that same device's identifier, **Then** the
   server rejects the request with a clear error and the device is
   not revoked.

2. **Given** a device is authenticated, **When** a revoke request is
   submitted targeting a different device's identifier, **Then** the
   server processes the request normally and the target device is
   revoked.

---

### Edge Cases

- What if the current device identifier cannot be determined during
  the revoke request? The server should reject the request rather
  than proceed.
- What if the UI fails to receive the current device identity? The
  revoke button should default to disabled (fail safe) rather than
  enabled.
- What if a user has only one device? The single device's revoke
  button is disabled — same behavior as the general case.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST identify which device is making the
  current request when processing device management actions.

- **FR-002**: The device list UI MUST render the "Revoke" action for
  the current device in a disabled, non-interactive state.

- **FR-003**: The device list UI MUST render the "Revoke" action for
  all other (non-current) devices in the normal enabled state.

- **FR-004**: The server MUST reject any revoke request where the
  target device is the same as the device making the request, and
  return an appropriate error response.

- **FR-005**: The server MUST continue to allow revoke requests
  targeting devices other than the requesting device, with no change
  to existing behavior.

- **FR-006**: If the current device identity cannot be determined,
  the UI MUST default to disabling the revoke button (fail-safe).

### Key Entities

- **Device**: A registered device associated with a user account,
  identified by a unique device identifier.

- **Current Device**: The device whose credentials were used to
  authenticate the active session. It cannot be self-revoked.

- **Revoke Action**: A user-initiated operation that deactivates a
  device, removing its access to the account.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of revoke requests targeting the requesting device
  are rejected by the server across all tested scenarios.

- **SC-002**: The "Revoke" button for the current device is disabled
  on 100% of device list page loads where the current device is
  identifiable.

- **SC-003**: All revoke operations targeting non-current devices
  continue to succeed — 0% regression in legitimate revoke
  functionality.

- **SC-004**: Users cannot successfully revoke their own active
  device through any normal interaction path (UI or direct request).

## Assumptions

- The system already tracks which device is active per session (from
  feature 045-indicate-current-device) and this identity is
  accessible when rendering the device list and handling revoke
  requests.
- "Revoke" is the sole mechanism for removing a device; no
  alternative path bypasses this constraint.
- The current device is identified by a device identifier present in
  the authenticated request context.
