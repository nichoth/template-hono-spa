# Feature Specification: Require Device Name

**Feature Branch**: `043-require-device-name`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "Make the Device name field required on the
profile page. The Add device button should be disabled until the name
field has a value."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Device With Name (Priority: P1)

A logged-in passkey user visits the Profile page and sees the "Add
Device" section. The device name field no longer says "(optional)" and
the "Add device" button is disabled by default. The user types a device
name, and the button becomes enabled. The user clicks "Add device" and
the invitation is created successfully with the name attached.

**Why this priority**: This is the core flow — all users adding a device
must now supply a name. It is the primary change and highest value.

**Independent Test**: Navigate to /profile as a passkey user, observe
the disabled button, type a name, observe the button become enabled,
submit — invitation is created.

**Acceptance Scenarios**:

1. **Given** a passkey user is on /profile, **When** the Add Device
   section loads, **Then** the device name field label reads "Device
   name" (not "Device name (optional)") and the "Add device" button is
   disabled.
2. **Given** the device name field is empty, **When** the user attempts
   to click "Add device", **Then** the button remains non-interactive
   (disabled).
3. **Given** the device name field contains at least one non-whitespace
   character, **When** the user views the button, **Then** the "Add
   device" button is enabled.
4. **Given** the device name field has a value, **When** the user clicks
   "Add device", **Then** the device invitation is created with that
   name.

---

### User Story 2 - Name Cleared After Submission (Priority: P2)

After a successful invitation is created, the device name field is
cleared (as it was before), and the "Add device" button returns to the
disabled state, ready for a new entry.

**Why this priority**: Ensures the UI is in a consistent, correct state
after each action.

**Independent Test**: Submit an invitation, observe field clears and
button disables.

**Acceptance Scenarios**:

1. **Given** a successful invite was just created, **When** the result
   is shown, **Then** the device name field is empty and the "Add
   device" button is disabled again.

---

### Edge Cases

- What happens if the user types only whitespace in the name field?
  Whitespace-only input should be treated as empty — button stays
  disabled.
- What if the user pastes content then clears it? Button should return
  to disabled state immediately.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The device name field label MUST read "Device name"
  without the "(optional)" qualifier.
- **FR-002**: The "Add device" button MUST be disabled when the device
  name field is empty or contains only whitespace.
- **FR-003**: The "Add device" button MUST become enabled as soon as the
  device name field contains at least one non-whitespace character.
- **FR-004**: The "Add device" button MUST return to the disabled state
  after a successful submission (when the field is cleared).
- **FR-005**: The device name value MUST be sent with the invitation
  creation request (it is no longer optional on the client side).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of "Add device" button clicks submit a non-empty
  device name — zero invitations can be created without a name from
  this form.
- **SC-002**: The button disabled/enabled state changes within one
  keystroke — users perceive immediate feedback.
- **SC-003**: The label change is visible immediately upon page load
  with no additional interaction required.

## Assumptions

- The server already accepts and stores the device name. No server-side
  changes are required.
- Whitespace-only strings are considered empty for the purpose of
  validation.
- The maximum length of the device name is not constrained by this
  feature (assumed handled elsewhere or not yet specified).
