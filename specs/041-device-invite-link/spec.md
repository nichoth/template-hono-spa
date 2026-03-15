# Feature Specification: Device Invite Link

**Feature Branch**: `041-device-invite-link`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "Need to update the 'Add device' flow on the /profile route. When you enter a device name and click 'Add device', the server should listen for the new device, then save the new device to a new record when the new device visits the unique URL."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Device Invitation (Priority: P1)

An authenticated passkey user navigates to their profile page, enters a name for the new device (e.g. "Work Laptop"), and clicks "Add device." Instead of triggering a passkey ceremony on the current browser, the system creates a unique, time-limited invitation link. The user is shown this link (and/or a QR code) so they can open it on the new device.

**Why this priority**: This is the core interaction that replaces the existing same-device registration flow. Without it, no cross-device registration is possible.

**Independent Test**: Can be fully tested by logging in, clicking "Add device", and verifying that a unique invitation URL is displayed to the user.

**Acceptance Scenarios**:

1. **Given** an authenticated passkey user on the profile page, **When** they enter a device name and click "Add device", **Then** the system displays a unique invitation link.
2. **Given** an authenticated passkey user on the profile page, **When** they click "Add device" without entering a device name, **Then** the system still generates an invitation link (the name is optional).
3. **Given** an authenticated passkey user who already has the maximum number of devices (10), **When** they attempt to add another device, **Then** the system displays an error explaining the limit has been reached.

---

### User Story 2 - Register from New Device (Priority: P1)

A user opens the invitation link on a new device (phone, tablet, second laptop). The page prompts the new device to perform a passkey registration ceremony. Upon successful registration, the new device's credential is saved and associated with the user's account under the previously chosen device name.

**Why this priority**: This is the other half of the core flow — without it, the invitation link serves no purpose. Both P1 stories together form the minimum viable feature.

**Independent Test**: Can be tested by visiting a valid invitation URL on a different device, completing the passkey ceremony, and verifying the device appears in the user's device list.

**Acceptance Scenarios**:

1. **Given** a valid, unused invitation link, **When** a new device visits it, **Then** the page initiates a passkey registration ceremony.
2. **Given** a new device that successfully completes the passkey ceremony, **When** registration finishes, **Then** the device is saved to the user's account with the pre-assigned device name.
3. **Given** a new device that successfully registers, **When** the original user refreshes their profile, **Then** the new device appears in their device list.

---

### User Story 3 - Invitation Expiration and Security (Priority: P2)

Invitation links expire after a limited time window. Expired or already-used links cannot be reused. The user who created the invitation can also cancel it before it is consumed.

**Why this priority**: Security hardening — important but the core flow must work first.

**Independent Test**: Can be tested by generating an invitation, waiting for it to expire, and verifying the link is rejected.

**Acceptance Scenarios**:

1. **Given** an invitation link that has expired, **When** a device visits it, **Then** the system displays a clear message that the invitation has expired and suggests the user generate a new one.
2. **Given** an invitation link that has already been used, **When** another device visits it, **Then** the system rejects it and displays that the invitation was already consumed.
3. **Given** a pending invitation, **When** the original user cancels it from their profile, **Then** the invitation becomes invalid.

---

### User Story 4 - Pending Invitation Visibility (Priority: P3)

While an invitation is active (not yet used or expired), the profile page shows its status — indicating that the system is waiting for the new device to claim it. The user can see which invitations are pending and cancel any they no longer need.

**Why this priority**: Enhances usability by giving the user visibility into outstanding invitations, but the core flow works without it.

**Independent Test**: Can be tested by generating an invitation and verifying the profile page shows a "pending" indicator for that device name.

**Acceptance Scenarios**:

1. **Given** an active invitation, **When** the user views their profile, **Then** they see the pending invitation with its device name and remaining time.
2. **Given** multiple pending invitations, **When** the user views their profile, **Then** all pending invitations are listed.

---

### Edge Cases

- What happens when the invitation link is opened on the same device that created it? The system should allow it — the user may be adding a second passkey on the same hardware.
- What happens if the user's session expires while an invitation is still pending? The invitation should remain valid since it is tied to the user account, not the session.
- What happens if the user revokes all other devices while an invitation is pending? The invitation should still be consumable since it will add a device, not remove one.
- What happens if two devices try to claim the same invitation simultaneously? Only the first to complete the ceremony should succeed; the second should see a "already used" error.
- What happens if the new device's passkey ceremony fails (user cancels browser prompt)? The invitation should remain valid so the user can retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate a unique, unguessable invitation link when an authenticated passkey user requests to add a device.
- **FR-002**: System MUST associate the invitation with the requesting user's account and the provided device name.
- **FR-003**: System MUST enforce a time-limited validity window on invitation links (default: 15 minutes).
- **FR-004**: When a new device visits a valid invitation link, the system MUST present a passkey registration ceremony.
- **FR-005**: Upon successful passkey registration via an invitation, the system MUST save the new device credential to the user's account using the device name from the invitation.
- **FR-006**: System MUST mark the invitation as consumed after successful device registration, preventing reuse.
- **FR-007**: System MUST reject expired invitation links with a clear user-facing message.
- **FR-008**: System MUST reject already-consumed invitation links with a clear user-facing message.
- **FR-009**: System MUST allow the inviting user to cancel a pending invitation from their profile.
- **FR-010**: System MUST enforce the existing maximum device limit (10 devices per user) when generating invitations, accounting for pending invitations.
- **FR-011**: System MUST allow the passkey ceremony to be retried if it fails, as long as the invitation has not expired.
- **FR-012**: System MUST display the invitation link inline on the profile page, below the "Add device" button and input, after the invitation is created. The link MUST include a one-click copy-to-clipboard control so the user can easily share it with the new device.

### Key Entities

- **Device Invitation**: Represents a pending request to add a new device. Key attributes: unique token, associated user, device name, creation time, expiration time, status (pending/consumed/cancelled/expired).
- **Device**: An existing entity representing a registered passkey credential. Gains a new pathway for creation (via invitation in addition to direct registration).

## Assumptions

- The existing device limit of 10 per user remains unchanged.
- The invitation expiration window of 15 minutes is a reasonable default for cross-device workflows (long enough to switch devices, short enough for security).
- The invitation page (visited by the new device) does not require the new device to be logged in — the invitation token itself serves as authorization for that single registration.
- This feature replaces the existing same-device "Add device" flow (which triggers a WebAuthn ceremony on the current browser).

## Dependencies

- Existing passkey registration infrastructure (WebAuthn ceremony support).
- Existing device management features (device list, revoke).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full cross-device registration flow (generate link, open on new device, register) in under 3 minutes.
- **SC-002**: 95% of invitation links are successfully consumed before expiration when the user has immediate access to the new device.
- **SC-003**: 100% of expired or consumed invitation links are properly rejected with a clear user message.
- **SC-004**: The new device appears in the user's device list within 5 seconds of completing registration.
- **SC-005**: Users can cancel a pending invitation and see it removed from their profile immediately.
