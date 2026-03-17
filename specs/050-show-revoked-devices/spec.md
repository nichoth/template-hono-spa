# Feature Specification: Show Revoked Devices in Profile

**Feature Branch**: `050-show-revoked-devices`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "In the /profile route, we want to show all
devices, including revoked devices in the list"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Devices Including Revoked (Priority: P1)

A logged-in user with passkey authentication visits their profile page. The
Devices section shows all registered devices — both active and revoked — in a
single unified list. Revoked devices are visually distinguished from active ones
so the user can easily understand the status of each device.

**Why this priority**: Core feature request. Without this, users have no
visibility into their revoked devices or device history.

**Independent Test**: Navigate to /profile as an authenticated passkey user who
has at least one revoked device. The revoked device appears in the list with a
clear visual indicator of its revoked status.

**Acceptance Scenarios**:

1. **Given** a user has one active and one revoked device, **When** they visit
   /profile, **Then** both devices appear in the Devices list with the revoked
   device clearly marked as revoked.

2. **Given** a user has only active devices, **When** they visit /profile,
   **Then** only active devices appear and no revoked label is shown on any
   entry.

3. **Given** a user has all devices revoked except the current one, **When**
   they visit /profile, **Then** the current device appears as active and all
   others display with a revoked indicator.

---

### User Story 2 - No Revoke Action on Revoked Devices (Priority: P2)

When a revoked device is shown in the list, it does not offer a "Revoke" button
since it has already been revoked. The entry is informational only.

**Why this priority**: Prevents confusing UI state and potential duplicate
revoke attempts.

**Independent Test**: Confirm that revoked device entries in the list have no
actionable revoke button.

**Acceptance Scenarios**:

1. **Given** a revoked device is shown in the list, **When** the user views
   that device entry, **Then** no "Revoke" button is present for that device.

---

### Edge Cases

- What if a user has no revoked devices? The list looks exactly as before —
  no revoked indicators or separate sections appear.
- What if all of a user's devices are revoked except the current one? The
  current device is still active and listed normally; all others show as
  revoked.
- What if a revoked device has no name? It falls back to "Unnamed" as with
  active devices.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Devices section MUST display all devices associated with the
  user's account, including those with a revoked status.
- **FR-002**: Revoked devices MUST be visually distinguished from active
  devices (e.g., labeled "Revoked", grayed out, or placed in a visually
  distinct group).
- **FR-003**: Revoked devices MUST NOT display a "Revoke" button or any
  interactive control that would change their status.
- **FR-004**: Active devices MUST continue to show all existing information
  and controls (revoke button, current device indicator, added/last-used
  dates).
- **FR-005**: Revoked device entries MUST display at minimum: the device name
  and the date added. Any other available metadata (last used date, revocation
  date) SHOULD also be shown.

### Key Entities

- **Device**: A registered passkey credential for a user account. Has a name,
  creation date, last-used date, revocation status (`isRevoked`), and a flag
  indicating whether it is the current session device.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All devices (active and revoked) are visible to the user on the
  profile page within the same page load — no additional navigation required.
- **SC-002**: Users can distinguish between active and revoked devices at a
  glance without needing supplemental documentation.
- **SC-003**: No regression in existing device management behavior — active
  device revocation and invitation flows work as before after this change.

## Assumptions

- The data source already stores revoked devices and their metadata; this
  feature is a display-only change.
- Revoked devices will be shown after active devices in the list, or grouped
  visually below them.
- No pagination is required; all devices fit in a single list.
