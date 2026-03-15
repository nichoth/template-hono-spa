# Feature Specification: Add Passkey Device

**Feature Branch**: `040-add-passkey-device`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "I need a way for users to add
additional devices if they are using passwordless logins
(passkeys)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a new passkey from an authenticated session (Priority: P1)

A user who is already signed in with a passkey wants to
register a second passkey so they can sign in from another
device (e.g. a new phone, tablet, or security key). The user
navigates to their profile or account settings, initiates
"Add device," completes the WebAuthn registration ceremony on
the new authenticator, and sees the new device appear in their
list of registered passkeys.

**Why this priority**: This is the core value of the feature.
Without it, users are locked to the single device they
registered with, which is a significant usability and account
recovery risk.

**Independent Test**: Sign in on device A, trigger the
add-device flow, complete the WebAuthn ceremony with a second
authenticator, then verify the new credential appears in the
devices list and can be used to sign in independently.

**Acceptance Scenarios**:

1. **Given** an authenticated passkey user, **When** the user
   initiates "Add device" and completes the WebAuthn
   registration ceremony, **Then** a new device record is
   persisted under their account and the user sees a
   confirmation.
2. **Given** an authenticated passkey user, **When** the user
   completes the add-device flow, **Then** the new passkey
   can be used to sign in from the new device without the
   original device present.
3. **Given** an authenticated passkey user, **When** the
   WebAuthn ceremony fails or is cancelled, **Then** no
   device is added and the user sees an appropriate error
   message.

---

### User Story 2 - View registered devices (Priority: P1)

A user wants to see all passkeys linked to their account so
they can verify which devices have access, review names, and
decide whether to add or remove any.

**Why this priority**: Users need visibility into their
registered devices before they can meaningfully add or manage
them. This story is co-equal with adding a device because
the UI surface is shared.

**Independent Test**: Sign in, navigate to the devices
section, and verify all registered passkeys are listed with
their names and last-used timestamps.

**Acceptance Scenarios**:

1. **Given** an authenticated passkey user with two or more
   registered devices, **When** the user views their device
   list, **Then** all active devices are shown with their
   name, creation date, and last-used date.
2. **Given** an authenticated passkey user with only one
   device, **When** the user views their device list,
   **Then** the single device is shown and the user can
   still initiate adding another.

---

### User Story 3 - Name a newly added device (Priority: P2)

When adding a new passkey, the user can provide a friendly
name (e.g. "Work Laptop", "YubiKey") so they can distinguish
devices later. If no name is provided, a sensible default is
used.

**Why this priority**: Naming improves usability but is not
strictly required for the add-device flow to function.

**Independent Test**: Add a device with a custom name and
verify the name appears in the device list. Add a device
without a name and verify a default name is assigned.

**Acceptance Scenarios**:

1. **Given** a user completing the add-device flow, **When**
   the user provides a custom name, **Then** that name is
   stored and displayed in the device list.
2. **Given** a user completing the add-device flow, **When**
   no name is provided, **Then** a default name is assigned
   automatically.

---

### User Story 4 - Revoke a registered device (Priority: P2)

A user who has lost a device or no longer wants it to have
access can revoke it from their device list. The revoked
device can no longer be used to sign in.

**Why this priority**: Device management is incomplete
without the ability to remove access, but the backend
already supports revocation. This story focuses on exposing
that capability in the UI.

**Independent Test**: Revoke a device from the list and
verify that authentication with the revoked credential
fails.

**Acceptance Scenarios**:

1. **Given** an authenticated user with multiple devices,
   **When** the user revokes one device, **Then** that
   device can no longer be used to sign in and it is removed
   from (or marked as revoked in) the device list.
2. **Given** an authenticated user with only one device,
   **When** the user attempts to revoke it, **Then** the
   system prevents the revocation to avoid locking the user
   out.

---

### Edge Cases

- What happens if the user's session expires mid-ceremony?
  The registration challenge should be rejected and the user
  prompted to re-authenticate.
- What happens if the same authenticator credential is
  registered twice? The system must reject the duplicate
  credential ID.
- What happens if the user has the maximum number of
  devices? The system should enforce a reasonable upper
  limit (10 devices) and inform the user.
- What happens if the user tries to add a device while not
  using passkey login (e.g. password-only account)? The
  feature should only be available to passkey users.

## Assumptions

- The existing backend already supports device persistence,
  revocation, and listing (spec 028). This feature adds a
  new registration ceremony flow for authenticated users
  and exposes device management in the client UI.
- The backend `startRegistration` currently rejects existing
  users and will need a separate "add device" endpoint that
  skips user creation and attaches the credential to the
  existing account.
- Email re-confirmation is not required when adding a device
  to an already-confirmed account.
- A reasonable default device name (e.g. "Device" + count
  or the current date) is acceptable when the user does not
  provide one.
- The maximum number of devices per account is 10.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a way for authenticated
  passkey users to initiate a WebAuthn registration ceremony
  that attaches a new credential to their existing account
  (without creating a new user).
- **FR-002**: System MUST allow authenticated users to
  complete the add-device WebAuthn ceremony, persisting the
  new device record under the existing user.
- **FR-003**: System MUST reject add-device requests from
  unauthenticated users or users who do not use passkey
  login.
- **FR-004**: System MUST reject duplicate credential IDs
  during the add-device flow.
- **FR-005**: System MUST enforce a maximum of 10 active
  devices per user account.
- **FR-006**: System MUST provide a view where authenticated
  passkey users can see all their registered devices with
  name, creation date, and last-used date.
- **FR-007**: System MUST allow users to assign a friendly
  name when adding a device; if omitted, a default name is
  assigned.
- **FR-008**: System MUST allow users to revoke any device
  except their last remaining active device.
- **FR-009**: System MUST log an auth event for each
  successful or failed add-device attempt.

### Key Entities

- **Device**: Represents a WebAuthn credential linked to a
  user account. Key attributes: credential ID, public key,
  counter, transports, AAGUID, friendly name, creation date,
  last-used date, revocation status. (Existing entity from
  spec 028 -- no schema changes needed.)
- **Auth Challenge**: Used to track the add-device WebAuthn
  ceremony with a new purpose value (e.g. "device_addition")
  distinct from initial registration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated passkey user can add a second
  device and use it to sign in independently within a
  single session, as confirmed by end-to-end tests.
- **SC-002**: Users can view, name, and revoke their
  registered devices from the account settings interface.
- **SC-003**: The system prevents a user from revoking their
  last active device, ensuring they are never locked out.
- **SC-004**: 100% of add-device attempts are logged as auth
  events (success or failure) as verified by integration
  tests.
- **SC-005**: The system enforces the 10-device limit and
  returns a clear message when the limit is reached.
