# Feature Specification: Signup Navigation And Confirmation

**Feature Branch**: `[026-signup-route]`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "Should have an additional Create Account nav link at the top [Image #1]. The link should go to the route `/signup`, which has a form very similar to the login page [Image #2] -- same passkey vs password radio buttons. The submit button text should say create account. After you click create account, the backend will send an email to the user to confirm their email address."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reach Signup From Top Navigation (Priority: P1)

A visitor who wants to register can reach the create-account route directly from the top navigation.

**Why this priority**: The top-level path to registration is the primary user-visible gap described in the request.

**Independent Test**: Open the app, confirm a `Create Account` navigation link appears in the top navigation, activate it, and verify the app reaches `/signup` without a full-page reload.

**Acceptance Scenarios**:

1. **Given** a visitor is viewing a public route with the top navigation, **When** they look at the main navigation links, **Then** they see a `Create Account` link alongside the existing links.
2. **Given** a visitor activates the `Create Account` link, **When** the app navigates, **Then** the visitor reaches the `/signup` route without leaving the client-side app.

---

### User Story 2 - Use A Signup Form That Matches Login Choices (Priority: P1)

A visitor on `/signup` sees a create-account form that feels consistent with the login screen, including the same passkey-versus-password choice.

**Why this priority**: The route must support the intended signup interaction, not just act as a navigation destination.

**Independent Test**: Open `/signup`, confirm the form includes passkey and password method choices like the login screen, and verify the primary action is clearly labeled `Create account`.

**Acceptance Scenarios**:

1. **Given** a visitor is on `/signup`, **When** the route renders, **Then** the route shows the same passkey and password choice pattern used on the login screen.
2. **Given** a visitor is ready to submit the signup form, **When** they view the primary action, **Then** the action text says `Create account`.

---

### User Story 3 - Receive Email Confirmation Guidance (Priority: P2)

A visitor who submits the signup form understands that the next step is email confirmation rather than immediate access.

**Why this priority**: The request explicitly defines email confirmation as the post-submit outcome, and users need clear guidance to complete registration.

**Independent Test**: Submit the create-account flow with valid details and verify the screen confirms that an email has been sent to the user for address confirmation.

**Acceptance Scenarios**:

1. **Given** a visitor submits valid create-account details, **When** the submission succeeds, **Then** the route tells the visitor that a confirmation email has been sent.
2. **Given** a visitor has submitted the create-account form, **When** the app shows the next step, **Then** the app does not imply that registration is complete before email confirmation.

### Edge Cases

- What happens when a visitor lands directly on `/signup` without using the top navigation?
- What happens when the signup form is submitted but the backend cannot start the email-confirmation flow?
- How does the route behave when the visitor switches between passkey and password methods after entering some information?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a `Create Account` link in the top navigation.
- **FR-002**: The system MUST navigate the `Create Account` link to the client-side route `/signup`.
- **FR-003**: The system MUST preserve direct access to `/signup` without requiring a full-page reload.
- **FR-004**: The system MUST render signup content on `/signup` that is clearly for creating a new account rather than signing in.
- **FR-005**: The system MUST present the same passkey-versus-password method selection pattern on `/signup` as on the login route.
- **FR-006**: The system MUST label the primary signup action as `Create account`.
- **FR-007**: The system MUST collect the information required to start account creation for the selected signup method.
- **FR-008**: The system MUST tell the visitor after a successful submission that a confirmation email has been sent to confirm their email address.
- **FR-009**: The system MUST avoid implying that account creation is fully complete before the email-confirmation step is finished.
- **FR-010**: The system MUST show actionable feedback when the signup request cannot be completed.

### Key Entities *(include if feature involves data)*

- **Signup Navigation Link**: The top-navigation entry that takes a visitor to `/signup`.
- **Signup Method Choice**: The visitor’s selected account-creation method, either passkey or password.
- **Signup Submission**: The set of visitor-provided details used to start account creation.
- **Email Confirmation Notice**: The success feedback shown after the backend starts the email-confirmation flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tested top-navigation renders display a `Create Account` link that routes to `/signup`.
- **SC-002**: 100% of tested visits to `/signup` show the passkey and password method choices and a primary action labeled `Create account`.
- **SC-003**: 100% of tested successful signup submissions show guidance that a confirmation email has been sent.
- **SC-004**: 100% of tested signup failures show feedback that tells the visitor what prevented the email-confirmation step from starting.

## Assumptions

- The feature applies to the existing public-facing client application and should fit into the current client-side navigation model.
- The existing `/signup` route can be refined to satisfy this feature instead of introducing a second registration path.
- A successful signup submission starts an email-confirmation flow rather than immediately granting a completed account session.
