# Feature Specification: Passkey Login Request Contract

**Feature Branch**: `022-passkey-login-payload`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "When I login with a passkey, what information do I send to the server? I am implementing the src/client/state.ts `State.login` method."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send the Required Passkey Assertion Data (Priority: P1)

As a developer implementing passkey login, I want a clear definition of the data the client must send to the server so I can complete the login request without guessing.

**Why this priority**: Without a clear request contract, passkey login cannot be implemented correctly and the client/server integration remains blocked.

**Independent Test**: The request contract can be validated by comparing the client payload against the documented required fields and confirming the server receives the full passkey assertion package.

**Acceptance Scenarios**:

1. **Given** a user approves a passkey sign-in on their device, **When** the client prepares the login request, **Then** it includes the passkey assertion data required for server verification.
2. **Given** a developer implements `State.login`, **When** they build the passkey request body, **Then** they can do so without inferring missing required fields.

---

### User Story 2 - Keep User Identity and Assertion Context Aligned (Priority: P2)

As a developer, I want the passkey login request to clearly define any identifier or context that accompanies the assertion so the server can match the sign-in attempt to the correct account and challenge.

**Why this priority**: The assertion payload is primary, but the surrounding context still needs to be unambiguous for reliable verification.

**Independent Test**: Review the documented contract and confirm it distinguishes between assertion data, account-identifying context, and challenge/session correlation data.

**Acceptance Scenarios**:

1. **Given** a passkey login attempt is started for a known account flow, **When** the client sends the request, **Then** the payload clearly separates account-identifying data from authenticator-produced assertion data.
2. **Given** a passkey login attempt depends on a server-provided challenge, **When** the assertion is sent back, **Then** the request contains the information needed to correlate the assertion to that challenge.

---

### User Story 3 - Define the Expected Login Response Boundary (Priority: P3)

As a developer implementing `State.login`, I want the expected server response and error boundary for passkey login to be documented so client state updates remain predictable.

**Why this priority**: Once the request contract is clear, the next risk is inconsistent assumptions about what success and failure responses look like.

**Independent Test**: Review the documented response expectations and confirm the client can distinguish successful login, invalid assertion, and retryable failure states.

**Acceptance Scenarios**:

1. **Given** the server accepts a passkey assertion, **When** the response is returned, **Then** the client can identify the signed-in user state from the documented success payload.
2. **Given** the server rejects the passkey assertion, **When** the response is returned, **Then** the client can identify the failure state without guessing whether the request format or credential verification failed.

### Edge Cases

- What happens when the user authenticates successfully on-device but the assertion response is missing one required field?
- How does the request contract handle sign-in flows that know the account identifier before the passkey prompt versus account-discovery flows that do not?
- What happens when the challenge used to create the passkey assertion has expired or no longer matches the current server session?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST define the complete client-to-server request contract for passkey login attempts.
- **FR-002**: The system MUST distinguish between authenticator-produced assertion data and any additional user or session context sent by the client.
- **FR-003**: The system MUST define which parts of the passkey login request are required for server verification and which are optional.
- **FR-004**: The system MUST define how the client correlates a passkey assertion response to the server-issued challenge or login attempt context.
- **FR-005**: The system MUST define the expected successful server response shape for passkey login so client user state can be updated consistently.
- **FR-006**: The system MUST define the expected failure response categories for rejected, malformed, expired, or otherwise unusable passkey login attempts.
- **FR-007**: Developers implementing `State.login` MUST be able to determine what data to send to the server and what response data to read back without reverse-engineering browser passkey objects or server expectations.

### Key Entities *(include if feature involves data)*

- **Passkey Login Assertion**: The client-side proof returned by the authenticator after the user approves a passkey sign-in, including the data the server must verify.
- **Login Attempt Context**: The account, challenge, and correlation information that ties a passkey assertion to a specific sign-in request.
- **Login Result**: The success or failure response returned by the server after verifying the passkey assertion.

## Assumptions

- The feature scope is limited to documenting and defining the passkey login request/response contract needed by `State.login`.
- The server verifies passkey assertions and already has or will have a challenge-based login flow.
- The client needs to send the authenticator assertion result plus any minimal context necessary for account lookup and challenge correlation.
- The client should not send unnecessary private device information beyond what is required for passkey verification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can implement the passkey branch of `State.login` using the documented request and response contract without introducing undocumented payload fields.
- **SC-002**: 100% of required passkey login request fields are explicitly identified as required or optional in the contract.
- **SC-003**: Reviewers can distinguish assertion data, account context, and login-result fields in under 5 minutes using the specification alone.
- **SC-004**: The documented contract reduces follow-up clarification questions about passkey login payload contents to zero for the initial implementation pass.
