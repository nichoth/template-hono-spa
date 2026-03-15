# Feature Specification: Fix Device Name Bug

**Feature Branch**: `042-fix-device-name`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "When I enter a name for the new device in the
Device name input, it still creates the invitation as Unnamed. This is a bug,
should have a test."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Named Device Invitation (Priority: P1)

When a user wants to add a new device, they fill in the "Device name" field
and click "Add device". The resulting invitation should carry the name they
entered, not "Unnamed".

**Why this priority**: This is the core bug. The name a user provides is
silently discarded, which is confusing and makes device management harder when
multiple pending invitations exist.

**Independent Test**: Can be fully tested by entering a name in the "Device
name" field, submitting the form, and verifying the pending invitation is
displayed with that name.

**Acceptance Scenarios**:

1. **Given** a user is on the profile page, **When** they type "My Laptop" in
   the "Device name" field and click "Add device", **Then** the pending
   invitation appears under "Pending Invitations" with the name "My Laptop".

2. **Given** a user is on the profile page, **When** they leave the "Device
   name" field empty and click "Add device", **Then** the pending invitation
   appears with the label "Unnamed".

3. **Given** a pending invitation exists with a specific name, **When** the
   user views the profile page, **Then** the invitation is listed with its
   correct name.

---

### Edge Cases

- What happens when the device name contains only whitespace? It should be
  treated as empty (i.e., "Unnamed").
- What happens when the device name is very long? It should be trimmed or
  truncated to a reasonable maximum length.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST pass the device name entered by the user to the
  invitation creation process.
- **FR-002**: System MUST display the device name on the pending invitation
  as entered by the user.
- **FR-003**: System MUST label invitations as "Unnamed" only when the user
  did not provide a name (or provided only whitespace).
- **FR-004**: System MUST have an automated test that verifies a named device
  invitation is created with the correct name.
- **FR-005**: System MUST have an automated test that verifies an unnamed
  device invitation is labeled "Unnamed" when no name is provided.

### Key Entities

- **Device Invitation**: Represents a pending request to add a new device.
  Has a name attribute that should reflect the user-supplied value, defaulting
  to "Unnamed" when none is provided.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of device invitations created with a name display that
  exact name in the pending invitations list.
- **SC-002**: Automated tests cover both the named and unnamed invitation
  creation flows, and all pass.
- **SC-003**: No regression — existing unnamed-invitation behavior is
  unchanged when the name field is left blank.

## Assumptions

- The "Device name" field is optional; leaving it blank produces an
  "Unnamed" invitation (existing behavior, confirmed correct).
- Whitespace-only input is treated the same as no input (reasonable default).
- The maximum device name length is not specified; a standard form-input
  limit (e.g., 100 characters) is assumed if not already enforced.
