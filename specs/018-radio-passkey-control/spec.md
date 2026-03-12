# Feature Specification: Radio Passkey Control

**Feature Branch**: `[018-radio-passkey-control]`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Please use the `@susbtrate-system/radio-input` element for the passkey vs password control, as seen here: [Image #1]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a sign-in method clearly (Priority: P1)

As a user on the login screen, I can choose between passkey and password using a familiar radio-button control so the available sign-in methods are easy to compare.

**Why this priority**: The request is specifically about replacing the current method-selection UX with a radio-style control, so that choice must be clear on first view.

**Independent Test**: Open the login screen and confirm the sign-in method selector uses a radio-button pattern with both passkey and password options visible together.

**Acceptance Scenarios**:

1. **Given** a user opens the login screen, **When** the method selector appears, **Then** the user sees both passkey and password as mutually exclusive radio-button options.
2. **Given** the login screen displays both sign-in methods, **When** the user selects one radio option, **Then** that method becomes the active path and the other option is visibly inactive.

---

### User Story 2 - Continue with passkey from the selected radio option (Priority: P2)

As a returning user with a passkey, I can choose the passkey radio option and continue without entering a password.

**Why this priority**: After the selector is introduced, passkey still needs to remain usable as a password-free path.

**Independent Test**: Open the login screen, select the passkey radio option, and confirm the screen presents the passkey path without requiring password entry.

**Acceptance Scenarios**:

1. **Given** a user selects the passkey option, **When** the screen updates, **Then** the interface emphasizes the passkey path without making password fields appear required.
2. **Given** a user has selected passkey, **When** they continue, **Then** the screen allows a passkey attempt without demanding a password first.

---

### User Story 3 - Fall back to password sign-in from the same selector (Priority: P3)

As a user who prefers passwords, I can select the password radio option and use the familiar identifier-and-password path.

**Why this priority**: The feature must preserve the existing password path while moving method selection into the requested control pattern.

**Independent Test**: Open the login screen, select the password radio option, and confirm the identifier and password fields become the active method controls.

**Acceptance Scenarios**:

1. **Given** a user selects the password option, **When** the screen updates, **Then** the password path shows the identifier and password fields needed for that method.
2. **Given** a user switches from passkey to password, **When** the password option becomes active, **Then** the screen clearly reflects that password is now the selected sign-in method.

### Edge Cases

- The login screen must not display both methods as active at the same time.
- Selecting passkey must not make password fields appear required until the password option is chosen.
- If a passkey attempt cannot continue, the password option must remain available in the same radio selector as fallback.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present passkey and password sign-in methods through a radio-button style selector on the login screen.
- **FR-002**: The radio selector MUST show passkey and password as mutually exclusive options within the same control group.
- **FR-003**: The system MUST make one sign-in method active at a time based on the selected radio option.
- **FR-004**: Users MUST be able to select the passkey option and begin that path without entering a password.
- **FR-005**: Users MUST be able to select the password option and access the identifier and password fields for that path.
- **FR-006**: The system MUST visually distinguish the active radio selection from the inactive sign-in method.
- **FR-007**: The system MUST ensure password-specific fields appear required only when the password option is selected.
- **FR-008**: The system MUST keep the password option visible as a fallback if a passkey attempt cannot continue.
- **FR-009**: The selector and surrounding login content MUST remain coherent with the referenced radio-button pattern.
- **FR-010**: Existing login route access and user-facing messaging MUST remain coherent after the radio-button selector is introduced.

### Key Entities *(include if feature involves data)*

- **Sign-In Method Option**: One selectable login method within the radio-button control group, such as passkey or password.
- **Login Method Selection State**: The current active option and the corresponding login controls shown on the screen.
- **Passkey Attempt**: A user action that starts the passkey path after the passkey radio option is selected.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users visiting the login screen can see both passkey and password options within one radio-button control group.
- **SC-002**: Users can switch between passkey and password in a single selection change without leaving the login screen.
- **SC-003**: Users who choose passkey can begin that path without entering a password.
- **SC-004**: In usability review, at least 90% of participants can correctly identify which sign-in method is active after interacting with the radio selector.

## Assumptions

- This feature changes the login method-selection pattern rather than expanding authentication scope beyond the existing login screen.
- The request to use a specific radio-input component is represented here as a requirement for a radio-button style selector matching the referenced example.
- The password path remains necessary as fallback even when passkey is presented as an option.
