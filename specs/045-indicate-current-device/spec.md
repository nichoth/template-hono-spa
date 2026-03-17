# Feature Specification: Indicate Current Device on Profile

**Feature Branch**: `045-indicate-current-device`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "On profile route, please add the text
`(current device)` next to the device that is being used to view the
page. In this example I am on device `aaaaa`"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Current Device Labeled (Priority: P1)

When a logged-in user visits the Profile page, they see a list of all
their registered devices. The device they are currently using to view
the page is visually distinguished with a "(current device)" label
next to its name.

**Why this priority**: This is the entire scope of the feature. It
directly reduces confusion about which device the user is on, which
matters when deciding whether to revoke access or manage devices.

**Independent Test**: Visit the profile page from a known device;
confirm that device shows "(current device)" and no other device does.

**Acceptance Scenarios**:

1. **Given** a user is logged in and has multiple registered devices,
   **When** they navigate to the Profile page,
   **Then** the device corresponding to their active session displays
   "(current device)" next to its name.

2. **Given** a user is logged in and has only one registered device,
   **When** they navigate to the Profile page,
   **Then** that single device displays "(current device)" next to its
   name.

3. **Given** a user is logged in,
   **When** they view the Profile page,
   **Then** no more than one device shows the "(current device)" label.

---

### Edge Cases

- What happens if the session's device identifier cannot be matched to
  any device in the list? The label should simply not appear on any
  device row rather than causing an error.
- What if a device was recently revoked but the session is still
  active? The label should not appear since the device would no longer
  be in the list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Profile page MUST display a "(current device)" label
  adjacent to the device name of the device associated with the user's
  active session.
- **FR-002**: The label MUST appear on exactly one device at a time
  (the device matching the current session).
- **FR-003**: If the active session's device cannot be matched to any
  listed device, no "(current device)" label MUST be shown.
- **FR-004**: The label MUST be visually inline with the device name
  so it is easily associated with that specific device.
- **FR-005**: The presence or absence of the label MUST NOT affect
  other device management actions (e.g., revoking a device).

### Key Entities

- **Device**: A registered device associated with a user account, with
  an identifier, name, creation date, and last-used date.
- **Session**: The active login context that identifies which device
  the current user is browsing from.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Profile page views display the "(current device)"
  label on the correct device row when a matching device exists.
- **SC-002**: 0 cases where more than one device row shows the
  "(current device)" label simultaneously.
- **SC-003**: Users can visually identify their current device without
  additional explanation or help text.
- **SC-004**: The label renders correctly on all supported screen sizes
  without layout breakage.

## Assumptions

- The session already carries enough information to identify which
  device the user is currently on (e.g., a device ID stored in the
  session cookie or token).
- The device identifier in the session directly maps to a device ID in
  the device list returned to the profile page.
- No new data storage or schema changes are required; the current
  device identification is a presentation concern derived from existing
  session data.
