# Feature Specification: Fix Radio Selection

**Feature Branch**: `[020-fix-radio-selection]`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "The radio buttons are janky. [Image #1] Please use the @ubstrate-system/radio-input element for the buttons, and use its stylesheet. A problem is that I have to click the button twice before I see it be selected. Something with the state is making is bad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select a sign-in method on the first click (Priority: P1)

As a user on the login screen, I can click a sign-in method once and immediately see that method selected so the interface feels reliable instead of broken.

**Why this priority**: The reported defect is that the current selector appears to require two clicks before the selection visibly changes, which makes the core login choice feel unstable.

**Independent Test**: Open the login screen, click passkey or password once, and confirm the selected radio option updates immediately on that same interaction.

**Acceptance Scenarios**:

1. **Given** the login screen is open, **When** the user clicks the password option once, **Then** the password option becomes visibly selected on that same click.
2. **Given** the login screen is open, **When** the user clicks the passkey option once, **Then** the passkey option becomes visibly selected on that same click.

---

### User Story 2 - See the shared radio control styling consistently (Priority: P2)

As a user comparing sign-in methods, I can see the selector rendered with the shared radio-control styling so the buttons look intentional and consistent with the rest of the product.

**Why this priority**: The request explicitly calls for using the shared radio-input element and its stylesheet instead of a janky mixed presentation.

**Independent Test**: Open the login screen and confirm the selector uses the shared radio-control styling, with the selected state visually updating immediately after one click.

**Acceptance Scenarios**:

1. **Given** the login screen loads, **When** the sign-in selector is shown, **Then** the selector uses the shared radio-input presentation rather than fallback browser styling or mismatched wrappers.
2. **Given** the user changes the selected method, **When** the state updates, **Then** the styled selected indicator remains synchronized with the current option.

---

### User Story 3 - Keep passkey and password content in sync with the selected option (Priority: P3)

As a user switching between passkey and password, I can trust that the visible login fields and actions match the currently selected method so I do not see conflicting states.

**Why this priority**: The reported bug points to selector state getting out of sync with what the user expects, so the content under the selector must move in lockstep with the visible selection.

**Independent Test**: Open the login screen, switch between passkey and password, and confirm the currently selected option, displayed guidance, and active login controls always match after a single click.

**Acceptance Scenarios**:

1. **Given** passkey is selected, **When** the user switches to password, **Then** the password option becomes selected and the password fields become the active controls immediately.
2. **Given** password is selected, **When** the user switches to passkey, **Then** the passkey option becomes selected and the passkey guidance and action become active immediately.

### Edge Cases

- Rapidly switching between passkey and password must not leave the wrong option visually selected.
- The selected radio state must remain correct after validation feedback or a passkey attempt message appears.
- The selector must not require separate clicks on both the label area and the radio control to show the selected state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present the login method selector using the shared radio-input control and its intended styling.
- **FR-002**: The system MUST update the visibly selected login method on the first click of a radio option.
- **FR-003**: The system MUST keep the selected radio indicator synchronized with the current login method state.
- **FR-004**: The system MUST make passkey and password mutually exclusive options within the same selector group.
- **FR-005**: The system MUST immediately update the active login content to match the newly selected method after one click.
- **FR-006**: The system MUST preserve the passkey path as a password-free option when passkey is selected.
- **FR-007**: The system MUST preserve the identifier-and-password path when password is selected.
- **FR-008**: The selector MUST continue to show both methods while the method-specific content changes.
- **FR-009**: Validation messages or submit feedback MUST not cause the visible selected state to lag behind the current method.
- **FR-010**: Existing login-route access and user-facing messaging MUST remain coherent after the selector behavior is corrected.

### Key Entities *(include if feature involves data)*

- **Sign-In Method Option**: One selectable login method in the shared radio-input selector, such as passkey or password.
- **Login Method Selection State**: The current selected option and the matching login controls that should appear immediately after selection.
- **Selected-State Feedback**: The visible indicator that shows which sign-in method is currently active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of method-selection interactions on the login screen show the new selected option after a single click.
- **SC-002**: Users can switch between passkey and password without seeing a stale or conflicting selected state.
- **SC-003**: Users can identify the active sign-in method immediately after each selection change during manual review.
- **SC-004**: Automated regression checks cover selector presence, single-click selection updates, and method-content synchronization on the login route.

## Assumptions

- The package name in the request refers to the already-installed shared radio-input control used elsewhere in the project.
- This feature is a bug fix and UX refinement for the existing login method selector rather than a change to authentication scope.
- The login route remains a UI-only flow, with passkey and password both staying available on the same screen.
