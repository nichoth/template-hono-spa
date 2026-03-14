# Feature Specification: Dedicated Signup Route

**Feature Branch**: `[024-signup-route]`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Please add a new route `/signup`. This is the route to create a new account. The login screen should have a link there, as seen here: [Image #1] . The `/signup` route should have a form similar to the login route, with the same radio button control: [Image #2] . Create account button should call a different API endpoint though."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reach Signup From Login (Priority: P1)

A visitor who lands on the sign-in screen can immediately see how to create a new account and can navigate to the dedicated signup screen from there.

**Why this priority**: If account creation is not clearly reachable from sign-in, new users cannot start onboarding at all.

**Independent Test**: Open the sign-in screen and confirm there is a clear create-account link that navigates to the signup screen without breaking the existing sign-in controls.

**Acceptance Scenarios**:

1. **Given** a visitor is on the sign-in screen, **When** they view the primary sign-in actions, **Then** they see a clear link to create a new account.
2. **Given** a visitor selects the create-account link, **When** navigation completes, **Then** the dedicated signup screen is shown.

---

### User Story 2 - Create Account On Dedicated Signup Screen (Priority: P1)

A new user can open the signup screen, choose an account creation method using the same radio-button style control used on sign-in, and submit account creation from that screen.

**Why this priority**: The main purpose of the feature is to separate account creation from sign-in while preserving a familiar method selector.

**Independent Test**: Open the signup screen, confirm the shared radio-button selector appears, complete the visible create-account form, and verify the create-account action is submitted through the account-creation path rather than the sign-in path.

**Acceptance Scenarios**:

1. **Given** a visitor is on the signup screen, **When** the page loads, **Then** they see an account-creation form with the same radio-button method selector pattern used on sign-in.
2. **Given** the passkey method is selected on the signup screen, **When** the visitor submits account creation, **Then** the system uses the account-creation flow rather than the sign-in flow.
3. **Given** the password method is selected on the signup screen, **When** the visitor views the form, **Then** the visible fields and actions match the selected method without mixing signup and sign-in states.

---

### User Story 3 - Keep Sign-In Focused On Existing Accounts (Priority: P2)

An existing user sees a sign-in screen dedicated to sign-in, while account creation lives on the dedicated signup screen.

**Why this priority**: Separating the responsibilities of the two screens reduces confusion and prevents sign-in UI from carrying hidden create-account behavior.

**Independent Test**: Open the sign-in screen and confirm it provides sign-in actions only, with no create-account button or hidden create-account-only form state.

**Acceptance Scenarios**:

1. **Given** a visitor is on the sign-in screen, **When** they use the passkey path, **Then** only sign-in actions are shown there.
2. **Given** a visitor is on the sign-in screen, **When** they inspect the visible signup affordances, **Then** they are directed to the dedicated signup screen instead of inline account creation.

### Edge Cases

- What happens when a visitor navigates directly to the signup URL without first visiting sign-in?
- How does the signup screen behave when the user switches between password and passkey methods after entering partial data?
- How does the sign-in screen behave when the user returns from signup after creating or abandoning an account?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated signup screen for new account creation.
- **FR-002**: The sign-in screen MUST include a visible link that takes users to the signup screen.
- **FR-003**: The sign-in screen MUST remain focused on existing-account sign-in and MUST NOT expose an inline create-account action.
- **FR-004**: The signup screen MUST use the same radio-button style method selector pattern used on the sign-in screen.
- **FR-005**: The signup screen MUST allow the user to switch between available account-creation methods and update the visible form controls to match the selected method.
- **FR-006**: The signup screen MUST submit account creation through a distinct account-creation handling path, separate from the sign-in submission path.
- **FR-007**: The system MUST preserve a clear distinction between sign-in outcomes and account-creation outcomes in user-facing messaging.
- **FR-008**: Direct navigation to the signup screen MUST render the account-creation experience without requiring prior navigation from sign-in.
- **FR-009**: The create-account link from sign-in and the signup screen itself MUST remain part of the primary client navigation flow.

### Key Entities *(include if feature involves data)*

- **Signup Screen**: The dedicated account-creation destination that presents the shared method selector and create-account submission action.
- **Signin Screen**: The existing-account entry point that links to signup but no longer owns inline account creation.
- **Method Selection State**: The current account-access method the user has chosen, which determines which controls and actions are visible on sign-in and signup.
- **Account Creation Submission**: The user-provided data and selected method used to create a new account through the account-creation flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new users can reach account creation from the sign-in screen in a single navigation step.
- **SC-002**: 100% of tested visits to the signup screen show a create-account action and do not show sign-in-only primary actions as the main submission path.
- **SC-003**: 100% of tested visits to the sign-in screen show a sign-in-only primary action and no inline create-account button.
- **SC-004**: Users can switch between the available signup methods on the signup screen and see the matching form state update on the first interaction.

## Assumptions

- The dedicated signup route is part of the same client-side application flow as the existing sign-in route.
- The account-creation method options shown on signup should mirror the sign-in method selector unless the existing product rules already restrict one of them.
- Existing account-creation backend capabilities can be reused, but the user experience should treat signup submission as a distinct flow from sign-in.
