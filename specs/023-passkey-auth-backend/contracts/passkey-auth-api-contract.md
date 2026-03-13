# Contract: Passkey Auth API

## Purpose

Define the backend API boundary for passkey registration, passkey sign-in, session restoration, sign-out, and the infrastructure dependency on `wrangler.jsonc` auth bindings.

## Environment Contract

- The Worker runtime exposes an auth persistence binding through `wrangler.jsonc`.
- The auth persistence binding name is `AUTH_DB` in default, staging, and test configuration.
- The auth persistence binding is available in local development, default deployment, and staging configuration.
- The D1 schema is applied from the checked-in migration in `migrations/0001_auth_schema.sql`.
- Session-related secrets or signing configuration, if required by the implementation, are exposed through Worker environment configuration rather than hard-coded values.
- `README.md` documents the steps required to provision D1 and configure any required auth-related bindings or secrets.

## Endpoint Contract

### `POST /api/auth/register/start`

**Request**
- Client supplies the requested account identifier and optional display information needed to prepare registration.

**Response**
- Returns registration challenge data and the temporary registration context needed to complete passkey creation.

**Failure Outcomes**
- Duplicate identifier
- Invalid or incomplete account input

### `POST /api/auth/register/finish`

**Request**
- Client supplies the registration context plus the passkey registration response returned by the browser ceremony.

**Response**
- Creates the user account, stores the passkey credential, starts an authenticated session, and returns authenticated user/session summary data.

**Failure Outcomes**
- Expired or invalid registration challenge
- Malformed or rejected passkey registration response
- Duplicate or conflicting account/credential state

### `POST /api/auth/login/start`

**Request**
- Client supplies sign-in discovery information needed to begin passkey authentication.

**Response**
- Returns authentication challenge data and the temporary login context needed to complete passkey sign-in.

**Failure Outcomes**
- Unknown or unusable account
- Account not eligible for passkey sign-in

### `POST /api/auth/login/finish`

**Request**
- Client supplies the login context plus the passkey assertion response returned by the browser ceremony.

**Response**
- Creates a new authenticated session and returns authenticated user/session summary data.

**Failure Outcomes**
- Expired or invalid login challenge
- Malformed, replayed, or rejected passkey assertion
- Credential does not map to a valid account

### `GET /api/session`

**Request**
- Client sends the active session credential.

**Response**
- Returns the authenticated user and session summary when the session is valid.

**Failure Outcomes**
- Missing session
- Expired or revoked session

### `POST /api/logout`

**Request**
- Client sends the active session credential.

**Response**
- Invalidates the current session and returns an unauthenticated success result.

**Failure Outcomes**
- Session already invalid

## Response Shape Expectations

- Success responses for completed registration and login include:
  - Authenticated user identifier
  - Display information needed by the client
  - Session validity summary
- Failure responses include:
  - Stable error category
  - Human-readable message appropriate for the current auth step
  - No leakage of credential verification internals beyond what is needed for user action

## Test Expectations

- Registration and sign-in must each be testable as two-step ceremonies with clear start and finish boundaries.
- Session restoration must be testable independently of sign-in.
- Sign-out must prove the prior session cannot be reused after invalidation.
- Configuration tests must verify that the auth persistence binding name expected by the server is documented and reflected in `wrangler.jsonc`.
