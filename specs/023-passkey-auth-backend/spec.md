# Feature Specification: Real Passkey Login Backend

**Feature Branch**: `023-passkey-auth-backend`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "I want to add a real login with passkey system. Please add D1 or any other Cloudflare services necessary to implement this. (add the backend so that users & sessions work)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create an account with a passkey (Priority: P1)

A new user can create an account, register a passkey, and finish sign-up with a usable authenticated session.

**Why this priority**: Without account creation and passkey registration, there is no real authentication system for new users.

**Independent Test**: Can be fully tested by registering a new account from the sign-up flow, confirming the passkey is bound to that account, and confirming the user enters an authenticated session immediately after completion.

**Acceptance Scenarios**:

1. **Given** a visitor does not yet have an account, **When** they complete sign-up with a valid identifier and a new passkey, **Then** the system creates a user account, stores the passkey credential, and starts an authenticated session.
2. **Given** a visitor starts sign-up, **When** passkey registration is rejected or fails, **Then** the system does not create a partial authenticated account and clearly tells the visitor that sign-up did not complete.
3. **Given** a visitor attempts to register with an identifier that is already in use, **When** they submit sign-up, **Then** the system rejects the duplicate account creation and directs them to sign in instead.

---

### User Story 2 - Sign in with an existing passkey (Priority: P2)

An existing user can sign in with a previously registered passkey and resume an authenticated session without using a password.

**Why this priority**: Returning-user sign-in is the core value of a passkey-based login system after registration exists.

**Independent Test**: Can be fully tested by signing in with an already registered passkey, confirming the request succeeds, and confirming authenticated account state is available on subsequent requests.

**Acceptance Scenarios**:

1. **Given** a user already has a registered passkey, **When** they complete a valid passkey sign-in ceremony, **Then** the system authenticates them and starts a new session.
2. **Given** a user begins passkey sign-in, **When** the assertion does not match a valid stored credential or challenge, **Then** the system rejects the sign-in attempt and does not create a session.
3. **Given** a user has signed in successfully, **When** they refresh or navigate within the app, **Then** the session remains recognized until it expires or they sign out.

---

### User Story 3 - Manage authenticated session state safely (Priority: P3)

An authenticated user stays signed in through a durable session and can sign out so that the app and backend both return to an unauthenticated state.

**Why this priority**: A login system is incomplete if authenticated state cannot be resumed safely or ended intentionally.

**Independent Test**: Can be fully tested by checking the current session after sign-in, confirming protected account state is available, then signing out and confirming the session is no longer usable.

**Acceptance Scenarios**:

1. **Given** a user has an active session, **When** the client asks for the current authenticated user, **Then** the system returns the matching account identity and session validity.
2. **Given** a user signs out, **When** a later request is made with the prior session, **Then** the system treats that session as invalid and returns an unauthenticated result.
3. **Given** a session has expired or been invalidated, **When** the client resumes activity, **Then** the system requires a fresh sign-in instead of silently treating the user as authenticated.

### Edge Cases

- What happens when a user starts passkey registration or sign-in in one tab and submits an older challenge from another tab?
- How does the system handle a user whose browser or device does not complete the passkey ceremony after the challenge is issued?
- What happens when a session record exists but the related user account is disabled, deleted, or no longer valid?
- How does the system respond when the client presents a malformed, incomplete, or replayed passkey response?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a visitor to create an account using a unique sign-in identifier and a passkey.
- **FR-002**: The system MUST generate a registration challenge for account creation and validate that the returned passkey response matches the issued challenge before creating the authenticated account session.
- **FR-003**: The system MUST persist user accounts, registered passkey credentials, issued login or registration challenges, and authenticated sessions across requests and process restarts.
- **FR-004**: The system MUST prevent duplicate registration of the same sign-in identifier for separate accounts unless the prior account is no longer valid for sign-in.
- **FR-005**: The system MUST allow an existing user with a registered passkey to request a sign-in challenge and complete sign-in with a valid passkey assertion.
- **FR-006**: The system MUST reject passkey registration or sign-in when the response is expired, malformed, replayed, not bound to the issued challenge, or not associated with a valid account credential.
- **FR-007**: The system MUST create a durable authenticated session after successful registration or sign-in and associate that session with the authenticated user.
- **FR-008**: The system MUST provide a way for the client to retrieve the currently authenticated user from the active session.
- **FR-009**: The system MUST provide a way for the client to sign out and invalidate the active session so it cannot be reused.
- **FR-010**: The system MUST expire sessions after a defined lifetime and treat expired sessions as unauthenticated.
- **FR-011**: The system MUST record enough account and session state to support auditability of successful sign-ins, failed sign-ins, session creation, and session invalidation.
- **FR-012**: The system MUST return clear failure outcomes for duplicate account creation, failed passkey ceremonies, expired challenges, invalid sessions, and unauthenticated requests.
- **FR-013**: The system MUST ensure the authenticated session boundary is enforced by the backend rather than relying solely on client-held state.
- **FR-014**: The system MUST support the current app flows for sign-up, sign-in, session restoration, and sign-out without requiring users to re-register a passkey on each visit.

### Key Entities *(include if feature involves data)*

- **User Account**: Represents a person who can sign in, including their sign-in identifier, display information, lifecycle status, and relationship to registered credentials and sessions.
- **Passkey Credential**: Represents a registered authenticator bound to a user account, including its credential identity, usage status, and verification-related metadata.
- **Auth Challenge**: Represents a time-limited registration or sign-in challenge issued to a client and later validated against the returned passkey response.
- **Session**: Represents an authenticated relationship between a client and a user account, including issuance, expiry, invalidation state, and current usability.
- **Auth Event**: Represents a security-relevant action such as registration success, sign-in success, sign-in failure, session creation, or sign-out.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete account creation with a passkey and reach an authenticated state in under 2 minutes on a supported device.
- **SC-002**: At least 95% of valid returning-user passkey sign-in attempts complete successfully on the first attempt in normal operation.
- **SC-003**: 100% of expired, replayed, or invalid passkey responses are rejected without creating an authenticated session.
- **SC-004**: 100% of successful sign-ins and registrations produce a retrievable authenticated session that remains valid across subsequent app requests until sign-out or expiry.
- **SC-005**: 100% of sign-out operations invalidate the prior session so later requests with that session are treated as unauthenticated.

## Assumptions

- The first release is passkey-first and does not require password-based account recovery or fallback authentication.
- The existing login and signup screens remain the primary entry points for registration, sign-in, and sign-out interactions.
- Managed Cloudflare-backed persistence and session infrastructure may be introduced during implementation, but the user-facing requirement is durable backend-backed authentication.
- Session lifetime, inactivity rules, and account-retention details will follow project defaults unless a later feature defines stricter policy requirements.
