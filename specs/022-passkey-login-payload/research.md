# Phase 0 Research: Passkey Login Request Contract

## Decision 1: Model passkey login around the post-assertion payload, not the browser prompt initiation

- **Decision**: Define the contract around the data the client sends after the authenticator returns a completed passkey assertion.
- **Rationale**: The user’s question is specifically about what the client sends to the server when logging in with a passkey, and `State.login` sits at the request boundary after credential collection.
- **Alternatives considered**:
  - Document the full browser prompt initiation flow as part of this feature: rejected because it broadens scope beyond the `State.login` server payload.
  - Treat passkey login as equivalent to password login with a single opaque blob: rejected because the request needs clearer field boundaries.

## Decision 2: Separate assertion data from account-identifying and challenge-correlation context

- **Decision**: Structure the contract so authenticator-produced assertion data is clearly distinct from any identifier, challenge reference, or attempt context the client must also send.
- **Rationale**: This separation is necessary for developers to understand which fields come from the browser credential object and which fields come from the surrounding login flow.
- **Alternatives considered**:
  - Collapse everything into one undifferentiated payload object: rejected because it hides which fields are required for verification versus routing/context.
  - Require only the assertion and no surrounding context: rejected because some login flows still need account or challenge correlation information.

## Decision 2a: Use explicit request field names in the client contract

- **Decision**: The client request body should use `credentialId`, `authenticatorData`, `clientDataJSON`, `signature`, optional `userHandle`, and a separate `context` object containing optional `accountIdentifier` and `challengeReference`.
- **Rationale**: These names are explicit enough to implement `State.login` without guessing which data belongs to the assertion itself versus the surrounding login attempt.
- **Alternatives considered**:
  - Use generic names like `credentialReference` or `clientData`: rejected because they are less precise at the request boundary.
  - Flatten all fields onto the top-level request body: rejected because it obscures the distinction between assertion and context.

## Decision 3: Document response categories the client state layer can act on immediately

- **Decision**: Define at least three client-visible response classes: successful login, invalid or rejected assertion, and unusable login attempt context such as expired or mismatched challenge.
- **Rationale**: `State.login` needs predictable categories for updating state, not just an undefined success/failure blob.
- **Alternatives considered**:
  - Document only the request and leave response behavior open-ended: rejected because the state layer still needs to know what it receives back.
  - Treat all failures as one generic error: rejected because expired context and invalid credentials often drive different client handling.

## Decision 4: Keep the contract implementation-agnostic while still specific enough for `State.login`

- **Decision**: Define the contract in terms of required payload sections and verification needs without binding it to a server library or browser object type name in the spec itself.
- **Rationale**: The feature spec must remain implementation-agnostic, but still answer the developer’s core question about what to send.
- **Alternatives considered**:
  - Specify a library-specific or server-framework-specific request schema: rejected because it would leak implementation detail into the planning artifacts.
  - Stay too abstract and say only “send the passkey assertion”: rejected because that does not answer the actual question usefully.
