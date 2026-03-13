# Research: Real Passkey Login Backend

## Decision 1: Use Cloudflare D1 as the primary auth persistence layer

**Decision**: Store user accounts, passkey credentials, registration and sign-in challenges, sessions, and auth events in a D1 database bound through `wrangler.jsonc`.

**Rationale**: The feature requires durable backend-backed authentication state. D1 fits the existing Cloudflare Worker deployment model, provides relational structure for accounts and sessions, and satisfies the explicit request to add D1 or other necessary Cloudflare services. Making the D1 binding explicit in `wrangler.jsonc` also turns environment setup into a first-class deliverable.

**Alternatives considered**:
- **KV-only storage**: Rejected because challenge/session/account relationships and uniqueness constraints are more naturally modeled in relational storage.
- **Durable Objects for primary auth state**: Rejected because the feature needs durable persistence more than per-user coordination actors.
- **Stateless session-only design**: Rejected because the feature explicitly requires backend-managed users and sessions.

## Decision 2: Use server-issued, time-limited challenge records for WebAuthn ceremonies

**Decision**: Persist registration and authentication challenges on the backend with issuance time, purpose, and account context, and verify returned passkey responses against those records before mutating account or session state.

**Rationale**: Challenge persistence is necessary to prevent replay, support multi-step browser/server ceremonies, and make failure handling auditable. It directly supports the feature requirements around malformed, expired, and replayed passkey responses.

**Alternatives considered**:
- **Client-only challenge tracking**: Rejected because the backend would be unable to make trusted verification decisions.
- **Unsigned ephemeral in-memory challenge cache**: Rejected because it would not survive process restarts and would be inconsistent with durable backend authentication.

## Decision 3: Use opaque server-managed session identifiers backed by D1

**Decision**: Create an opaque session identifier after successful registration or sign-in, persist it in D1 with expiry and invalidation state, and use that persisted session to restore authenticated user state and enforce sign-out.

**Rationale**: This keeps the backend as the source of truth for authentication, supports explicit session invalidation, and works with the existing app flow that needs a current-user endpoint and durable authenticated state across requests.

**Alternatives considered**:
- **Purely self-contained bearer tokens without server state**: Rejected because sign-out and session invalidation would be weaker and less aligned with the feature requirements.
- **Browser-only authenticated state**: Rejected because it does not create a real backend session system.

## Decision 4: Treat `wrangler.jsonc` bindings and environment configuration as part of the feature design

**Decision**: The implementation must add the necessary auth resource bindings in `wrangler.jsonc`, including the D1 binding and any associated environment-specific configuration required for local development and deployed environments.

**Rationale**: The user explicitly requested binding updates. Planning this work early avoids a backend design that cannot be run locally or deployed consistently.

**Alternatives considered**:
- **Deferring binding setup until implementation polish**: Rejected because the backend cannot be exercised reliably without named bindings.
- **Using only production bindings without staging/local parity**: Rejected because the project already uses environment-specific Wrangler configuration and the auth system must work across those contexts.

## Decision 5: Expose explicit auth endpoints for registration, login, session lookup, and logout

**Decision**: Add backend endpoints for starting and completing passkey registration, starting and completing passkey login, fetching the current session user, and signing out.

**Rationale**: The existing app already separates client state from backend API requests. Explicit endpoint boundaries make the multi-step passkey flow testable and map cleanly to user stories.

**Alternatives considered**:
- **Single multiplexed auth endpoint**: Rejected because it obscures ceremony boundaries and increases ambiguity in client and test flows.
- **Embedding auth state only in page loads**: Rejected because the app is already SPA-driven and needs explicit API access from client state.
