# Feature Specification: Login Radio Style

**Feature Branch**: `[019-login-radio-style]`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Need you to use the radio input custom element [Image #1]. Should look like this: [Image #2] For the passkey vs password login"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a familiar method selector on login (Priority: P1)

As a user opening the login screen, I can see passkey and password presented in the same radio-style selector pattern used elsewhere in the product so the choice feels familiar and easy to scan.

**Why this priority**: The request is primarily about replacing the current login selector treatment with the shared radio-control presentation shown in the reference.

**Independent Test**: Open the login screen and confirm passkey and password appear together as one radio-style selector, visually matching the referenced create-account pattern in layout, spacing, and selected-state clarity.

**Acceptance Scenarios**:

1. **Given** a user opens the login screen, **When** the method selector is shown, **Then** passkey and password appear together as mutually exclusive radio options.
2. **Given** the user compares the selector to the shared reference pattern, **When** they view the login screen, **Then** the selector uses the same visual treatment for option layout, spacing, and selected state.

---

### User Story 2 - Continue with passkey from the selected option (Priority: P2)

As a returning user with a passkey, I can keep using the passkey path after the new selector styling is introduced so I do not need to enter a password.

**Why this priority**: The selector update must preserve the password-free path that motivated the earlier login UX work.

**Independent Test**: Open the login screen, leave or switch the selector to passkey, and confirm the passkey path is active without requiring password entry.

**Acceptance Scenarios**:

1. **Given** passkey is the selected option, **When** the user reviews the active login path, **Then** the screen emphasizes the passkey flow and does not require password fields.
2. **Given** a user wants to continue with passkey, **When** they activate the passkey action, **Then** the attempt can begin without first switching screens or filling password inputs.

---

### User Story 3 - Fall back to password without losing the shared pattern (Priority: P3)

As a user who prefers passwords, I can switch to the password option and use the familiar credential fields while the selector still matches the shared radio-control pattern.

**Why this priority**: The visual update cannot regress the existing password fallback or create a mismatched second mode of navigation.

**Independent Test**: Open the login screen, switch the selector to password, and confirm the credential fields become active while the selector remains visible and styled consistently with the reference pattern.

**Acceptance Scenarios**:

1. **Given** a user selects the password option, **When** the login screen updates, **Then** the identifier and password fields become the active controls for sign-in.
2. **Given** a user switches between passkey and password, **When** the active option changes, **Then** the selector continues to show a single clear selected state and both methods remain available.

### Edge Cases

- The login screen must never show both passkey and password as selected at the same time.
- The selector must remain understandable if the passkey path is unavailable or canceled, with password still visible as fallback.
- The visual treatment must remain coherent if the method label text wraps or the layout narrows.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present passkey and password on the login screen through a single radio-style method selector.
- **FR-002**: The selector MUST use the shared radio-control presentation reflected in the provided reference, including comparable option arrangement, spacing, and selected-state emphasis.
- **FR-003**: The selector MUST show passkey and password as mutually exclusive options in the same control group.
- **FR-004**: The system MUST make exactly one sign-in method active at a time based on the selected option.
- **FR-005**: Users MUST be able to keep passkey selected and begin that path without entering a password.
- **FR-006**: Users MUST be able to switch to password and access the identifier and password fields for that path.
- **FR-007**: The login screen MUST keep the selector visible while method-specific content updates below or beside it.
- **FR-008**: The active option MUST be visually distinguishable from the inactive option using the shared radio-control pattern.
- **FR-009**: Password-specific required states MUST appear only when the password option is active.
- **FR-010**: The password option MUST remain available as fallback if a passkey attempt cannot continue.
- **FR-011**: Existing login route messaging and route access MUST remain coherent after the selector styling update.

### Key Entities *(include if feature involves data)*

- **Sign-In Method Option**: One selectable login method shown in the shared radio-style selector, such as passkey or password.
- **Login Method Selection State**: The current active option and the corresponding login controls shown for that method.
- **Shared Selector Presentation**: The expected arrangement, spacing, and selected-state treatment that aligns the login selector with the referenced create-account pattern.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users visiting the login screen can see passkey and password together in one radio-style selector.
- **SC-002**: Users can identify the active sign-in method within 3 seconds of viewing the login screen in moderated review.
- **SC-003**: Users can switch between passkey and password in a single selection change without leaving the login screen.
- **SC-004**: At least 90% of evaluators judge the login selector to visually match the referenced shared selector pattern closely enough that it feels like the same control family.

## Assumptions

- The request is to align the login method selector with the existing shared create-account radio pattern rather than introduce a new authentication method.
- The login route remains a UI-only flow for this feature and does not expand backend authentication scope.
- The passkey path remains the preferred password-free option, while password remains the visible fallback.
