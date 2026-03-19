# Feature Specification: Profile Device List Visibility

**Feature Branch**: `051-fix-profile-devices`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "A new bug - I am logged in but the Devices list of my devices in route `/profile` does not show anything. It should have at least 1 device, the one I am using. [Image #1]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Registered Devices (Priority: P1)

As an authenticated user, I can open `/profile` and immediately see the devices registered to my account so I can confirm which devices are allowed to sign me in.

**Why this priority**: The profile page is currently failing its core device-management purpose if it hides the user's active devices, including the device tied to the current session.

**Independent Test**: Sign in with a user account that has at least one active registered device, open `/profile`, and confirm the devices section shows one or more devices without requiring a page refresh or secondary action.

**Acceptance Scenarios**:

1. **Given** an authenticated user with one active registered device, **When** they open `/profile`, **Then** the Devices section shows that device.
2. **Given** an authenticated user whose current session is associated with a registered device, **When** they view the Devices section, **Then** the current device is included in the list and remains identifiable as the current device.

---

### User Story 2 - Distinguish Empty And Error States (Priority: P2)

As an authenticated user, I can tell whether I truly have no visible devices or whether the device list failed to load, so I am not misled by a blank section.

**Why this priority**: A silent blank state makes the bug indistinguishable from a legitimate empty account and blocks user trust in device management.

**Independent Test**: Verify that a successful response with no visible devices shows an explicit empty-state message, and that a failed load shows an explicit error state instead of an empty gap.

**Acceptance Scenarios**:

1. **Given** the user has no visible devices to show, **When** they open `/profile`, **Then** the Devices section shows an explicit empty-state message.
2. **Given** the device list cannot be loaded, **When** the user opens `/profile`, **Then** the Devices section shows an error message and does not appear as a silent blank state.

### Edge Cases

- What happens when the profile page loads before session restoration finishes? The device list should not appear empty until the authenticated state has been resolved.
- What happens when the current session is valid but the current device record is missing or revoked? The page should still show all remaining visible devices and present the current-session indicator only when a matching device is available.
- What happens when the user has pending device invitations but only one active registered device? The registered device list should still show the active device separately from any pending invitations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST populate the Devices section on `/profile` for authenticated users using the registered devices associated with their account.
- **FR-002**: The system MUST show at least one device in the Devices section when the authenticated user has an active registered device associated with the current account.
- **FR-003**: The system MUST include the device associated with the current authenticated session in the Devices section whenever that device is still visible to the user.
- **FR-004**: The system MUST preserve the distinction between loading, empty, and error states for the Devices section so a blank area is never used to represent those states.
- **FR-005**: The system MUST keep the Devices section scoped to the authenticated user's account and MUST NOT display devices belonging to another user.
- **FR-006**: The system MUST continue to show device details needed for account management, including a human-readable device label and relevant activity or creation timing when available.
- **FR-007**: The system MUST keep the registered device list visible when related profile features, such as pending invitations or add-device controls, are also present on the page.

### Key Entities *(include if feature involves data)*

- **Registered Device**: A user-linked sign-in device that can appear in the profile device list, including its label, visibility status, creation time, and recent-use information.
- **Authenticated Session**: The active signed-in session for the current user, which may reference the device currently being used.
- **Device List View State**: The profile page state that determines whether the Devices section is loading, populated, empty, or showing an error.

## Assumptions

- Each user who is currently signed in through a registered device should normally have at least one visible active device.
- Pending invitations are related but separate from the registered device list and should not replace or hide registered devices.
- If a user truly has no visible registered devices, the product should communicate that explicitly rather than leaving the section blank.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of test sessions where an authenticated user has one or more visible registered devices, opening `/profile` shows at least one device entry.
- **SC-002**: In 100% of test sessions where the current session is tied to a visible registered device, the current device appears in the Devices section.
- **SC-003**: In 100% of tested failure cases, the Devices section shows an explicit loading, empty, or error message instead of a blank area.
- **SC-004**: Support or QA can determine within 10 seconds whether `/profile` is showing a real empty state or a loading/error state based on the page content alone.
