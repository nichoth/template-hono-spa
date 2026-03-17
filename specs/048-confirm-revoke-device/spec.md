# Feature Specification: Confirm Revoke Device

**Feature Branch**: `048-confirm-revoke-device`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "Please ask for confirmation before revoking a
device. Should open a modal window with a button like Revoke this device"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirm Before Revoking a Device (Priority: P1)

An authenticated user who manages their linked devices wants to revoke
access for one of them. Before the revocation takes effect, a confirmation
modal appears so the user can verify their intent and avoid accidental
removal.

**Why this priority**: Preventing accidental device revocation is the core
value of this feature. Without this safeguard, users may lose access to
devices unintentionally with no way to undo the action quickly.

**Independent Test**: Can be fully tested by navigating to the device list,
clicking the revoke action on any device, observing the confirmation modal,
confirming, and verifying the device is removed from the list.

**Acceptance Scenarios**:

1. **Given** a user is viewing their list of linked devices,
   **When** they click the revoke action on a device,
   **Then** a confirmation modal appears with the device name and a
   "Revoke this device" button before any revocation occurs.

2. **Given** the confirmation modal is open,
   **When** the user clicks "Revoke this device",
   **Then** the device is revoked, the modal closes, and the device no
   longer appears in the list.

3. **Given** the confirmation modal is open,
   **When** the user cancels or dismisses the modal (e.g. clicks Cancel
   or presses Escape),
   **Then** no revocation occurs and the device remains in the list.

---

### User Story 2 - Cancel Revocation Mid-Flow (Priority: P2)

A user who accidentally triggered the revoke action should be able to
abort the process without any side effects.

**Why this priority**: Accidental clicks are common. The modal's cancel
path must be clearly accessible and must produce no change in state.

**Independent Test**: Can be tested by opening the confirmation modal and
then dismissing it via Cancel button or clicking outside the modal,
confirming no change to the device list.

**Acceptance Scenarios**:

1. **Given** the confirmation modal is open,
   **When** the user clicks the Cancel button,
   **Then** the modal closes and the device remains in the list unchanged.

2. **Given** the confirmation modal is open,
   **When** the user clicks outside the modal overlay,
   **Then** the modal closes and no revocation is triggered.

3. **Given** the confirmation modal is open,
   **When** the user presses the Escape key,
   **Then** the modal closes and no revocation is triggered.

---

### Edge Cases

- What happens if the device is revoked by another session while the
  modal is open? The system should handle the subsequent server error
  gracefully and inform the user.
- What happens if network connectivity is lost while the user confirms?
  The system should display an error and leave the device list unchanged.
- What if the user attempts to revoke the only remaining device or the
  current device? Prior feature restrictions remain in effect; the
  confirmation modal is still shown but the revocation is blocked after
  confirmation with an appropriate message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST NOT revoke a device without first displaying
  a confirmation modal to the user.
- **FR-002**: The confirmation modal MUST identify the device being revoked
  by its name.
- **FR-003**: The confirmation modal MUST contain a clearly labeled
  "Revoke this device" action button.
- **FR-004**: The confirmation modal MUST contain a Cancel option that
  closes the modal without performing any action.
- **FR-005**: Dismissing the modal via keyboard (Escape) or clicking
  outside the modal MUST cancel the operation with no side effects.
- **FR-006**: Upon confirming revocation, the system MUST revoke the
  device and remove it from the user's device list.
- **FR-007**: If the revocation request fails, the system MUST display an
  error message and leave the device list unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of device revocation attempts require a confirmation
  step; no device can be revoked in a single click.
- **SC-002**: Users can complete the full confirm-and-revoke flow in under
  30 seconds.
- **SC-003**: Cancelling the modal results in zero changes to the device
  list in 100% of cases.
- **SC-004**: Accidental revocation incidents decrease to near zero after
  release, measurable via support tickets or immediate re-adds.
- **SC-005**: The confirmation modal is operable via keyboard alone,
  meeting baseline accessibility requirements.

## Assumptions

- The device list page and revoke trigger already exist; this feature
  adds a confirmation layer on top of the existing flow.
- Device revocation is irreversible from the UI; no undo is offered
  after confirmation.
- The device is identified to the user by its previously assigned name.
- Restrictions on revoking the current device or the last device are
  enforced by prior features and remain in effect after confirmation.
