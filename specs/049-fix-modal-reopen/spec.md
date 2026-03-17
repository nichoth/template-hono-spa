# Feature Specification: Fix Modal Reopen State

**Feature Branch**: `049-fix-modal-reopen`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "If I click revoke and the modal opens,
then I close the modal, then I cannot open the modal a second time.
I want to simplify the open/closed state of the modal window."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reopen Revoke Modal (Priority: P1)

A user views their registered devices on the profile page. They click
"Revoke" on a device, the confirmation modal appears. They change their
mind and close the modal without confirming. Later in the same session,
they click "Revoke" again (on the same or a different device) and the
modal opens correctly.

**Why this priority**: This is the primary reported bug. The modal
becoming non-functional after a single dismissal makes the revoke
feature unusable if the user changes their mind.

**Independent Test**: Can be fully tested by clicking "Revoke", closing
the modal via Cancel or backdrop, then clicking "Revoke" again and
observing whether the modal opens.

**Acceptance Scenarios**:

1. **Given** the revoke confirmation modal is open, **When** the user
   closes it via the Cancel button, **Then** the modal closes and the
   page returns to its normal state.

2. **Given** the modal was previously opened and closed, **When** the
   user clicks "Revoke" on any eligible device, **Then** the modal
   opens correctly and displays that device's name.

3. **Given** the modal was previously opened and closed for device A,
   **When** the user clicks "Revoke" on device A again, **Then** the
   modal opens correctly (same device, same trigger).

---

### Edge Cases

- What happens when the user closes the modal by pressing Escape?
  The modal must be re-openable afterward.
- What happens when the user rapidly clicks "Revoke" multiple times?
  Only one modal instance should be open at a time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The revoke confirmation modal MUST open each time the user
  clicks "Revoke" on any eligible device, regardless of prior open/close
  history within the same session.

- **FR-002**: Closing the modal by any means (Cancel button, backdrop
  click, Escape key) MUST fully reset the modal's visible state so that
  a subsequent "Revoke" click works correctly.

- **FR-003**: The targeted device name MUST be correctly displayed in
  the modal each time it opens, including when re-opened after a prior
  dismissal.

- **FR-004**: The open/closed state of the modal MUST be controlled by
  a single, authoritative value rather than being inferred from a
  secondary piece of data whose value may not change between opens.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The revoke modal opens successfully on every "Revoke"
  click, including clicks that follow a prior dismissal of the same
  modal within the same session.

- **SC-002**: Every modal close action (Cancel button, backdrop click,
  Escape key) results in a state from which the modal can be re-opened
  without a page reload.

- **SC-003**: The device name shown in the modal is correct on every
  open, including re-opens targeting the same device.

## Assumptions

- The `ModalWindow` component exposes imperative `open()` and `close()`
  methods that control its visibility.
- The root cause is that modal visibility is inferred from whether a
  "target device" value is set. When the same device is clicked twice,
  the value is unchanged, so no re-open is triggered.
- The fix decouples modal visibility from the target device by
  introducing a dedicated boolean that controls open/closed state.
