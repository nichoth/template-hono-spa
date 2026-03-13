# Feature Specification: Passkey Login UX

**Feature Branch**: `[017-passkey-login-ux]`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "The login screen shows only a username and password field. We need to give the option to login with just a passkey. Please figure out what the best UX for this is. One option is to provide a radio button that selects password vs passkey [Image"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in quickly with a passkey (Priority: P1)

As a returning user with a passkey, I can choose the passkey path from the login screen and continue without entering a password.

**Why this priority**: This is the new capability the feature exists to provide, and it should be available with minimal friction from the first login screen view.

**Independent Test**: Open the login screen and confirm there is a clear passkey sign-in path that can be selected and attempted without filling in the password field.

**Acceptance Scenarios**:

1. **Given** a returning user opens the login screen, **When** they review the available sign-in choices, **Then** they can immediately identify a passkey option without scanning through password-specific fields first.
2. **Given** a returning user chooses the passkey sign-in path, **When** the screen switches into that mode, **Then** the interface allows the user to proceed without requiring password entry.

---

### User Story 2 - Fall back to password sign-in (Priority: P2)

As a user who does not want to use a passkey, I can continue to sign in with my existing password flow.

**Why this priority**: Adding passkeys must not remove or obscure the current path for users who still rely on passwords.

**Independent Test**: Open the login screen, choose the password sign-in path, and confirm the familiar identifier and password flow remains available and understandable.

**Acceptance Scenarios**:

1. **Given** a user prefers password sign-in, **When** they choose that method, **Then** the login screen presents the identifier and password fields needed for that path.
2. **Given** a user switches away from passkey sign-in to password sign-in, **When** the password path becomes active, **Then** the screen clearly indicates that password entry is now the selected method.

---

### User Story 3 - Understand which sign-in method is active (Priority: P3)

As a user, I can tell which sign-in method I am about to use and switch methods without confusion.

**Why this priority**: The UX change introduces a choice, so the screen must make the current state obvious and reversible.

**Independent Test**: Open the login screen, switch between passkey and password methods, and confirm the active path is obvious and the screen content updates accordingly.

**Acceptance Scenarios**:

1. **Given** the login screen offers more than one sign-in method, **When** the user changes methods, **Then** the active method is visually distinct from the inactive option.
2. **Given** the user changes methods, **When** the screen updates, **Then** only the controls relevant to the chosen method remain emphasized so the next action is unambiguous.

### Edge Cases

- A user who lands on the login page for the first time must still understand both available sign-in methods without needing prior product knowledge.
- Switching between password and passkey methods must not leave the screen in a mixed state where password-specific fields appear required for a passkey attempt.
- If passkey sign-in cannot continue, the interface must leave the password method available as a clear fallback.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST update the login screen to present both password sign-in and passkey sign-in as supported methods.
- **FR-002**: The system MUST make the passkey sign-in path visible on the initial login screen without requiring the user to first complete password-specific fields.
- **FR-003**: Users MUST be able to initiate passkey sign-in without entering a password.
- **FR-004**: The system MUST preserve an identifiable password sign-in path for users who prefer or require it.
- **FR-005**: The system MUST provide a clear method-switching control that shows which sign-in method is active at any moment.
- **FR-006**: The system MUST ensure the active sign-in method controls are visually emphasized and that inactive-method controls do not appear to be required.
- **FR-007**: The system MUST allow users to switch between sign-in methods from the login screen without losing the ability to continue their preferred method.
- **FR-008**: The system MUST present the passkey path using an action-oriented experience rather than forcing users to interpret a low-context technical choice before proceeding.
- **FR-009**: If a passkey attempt cannot continue, the system MUST keep the password sign-in path available as a visible fallback on the same screen.
- **FR-010**: Existing login messaging and route access MUST remain coherent after the additional sign-in method is introduced.

### Key Entities *(include if feature involves data)*

- **Sign-In Method**: The user-selected path for logging in, such as passkey or password.
- **Login Method State**: The visible state of the login screen that determines which controls, instructions, and next action are currently active.
- **Passkey Attempt**: A user action that starts the passkey sign-in flow without requiring password entry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users visiting the login screen can identify both available sign-in methods within one screen view.
- **SC-002**: Users who prefer passkeys can begin the passkey flow in one primary action from the login screen without entering a password.
- **SC-003**: Users who prefer passwords can still reach the password path without extra navigation or confusion after the passkey option is added.
- **SC-004**: In usability review, the active sign-in method is correctly identified by at least 90% of participants before they attempt submission.

## Assumptions

- This feature extends the current login route experience and does not by itself redefine the broader authentication architecture outside the login screen.
- The recommended UX is to provide a direct passkey action with a clear password fallback, rather than relying on radio buttons as the primary method-selection pattern.
- The login screen should continue to support users who are unfamiliar with passkeys by keeping password sign-in visible and understandable.
