# Data Model: Staging Site Access Control

## Entity: DeploymentContext

- Description: Runtime classification used to decide whether a request is public or protected.
- Fields:
  - `branchName` (string): Normalized deployment branch identifier.
  - `environmentType` (enum): `main`, `staging`, `preview`, or `unknown`.
  - `requiresAuth` (boolean): Whether the request must pass a basic-auth check before route handling continues.
- Validation rules:
  - `requiresAuth` must be `false` for production/main traffic.
  - `requiresAuth` must be `true` for the dedicated staging deployment.
  - `requiresAuth` must remain `false` for localhost development behavior.

## Entity: BasicAuthCredential

- Description: Parsed request credentials extracted from the authorization header.
- Fields:
  - `username` (string | null): Submitted username when parsing succeeds.
  - `password` (string | null): Submitted password when parsing succeeds.
  - `isMalformed` (boolean): Whether the header format is invalid.
- Validation rules:
  - Missing or malformed values cannot authorize access to a protected staging request.
  - Credentials are only evaluated when the request environment requires protection.

## Entity: AccessDecision

- Description: Final request-gating result returned before route handling.
- Fields:
  - `isAuthorized` (boolean): Whether the request proceeds to the next handler.
  - `challengeReturned` (boolean): Whether a 401 basic-auth challenge is sent.
  - `decisionReason` (enum): `public-environment`, `valid-credentials`, `missing-credentials`, `invalid-credentials`, or `malformed-credentials`.
- Validation rules:
  - Protected staging requests require `isAuthorized=true` only when credentials match configured secrets.
  - Unauthorized protected requests must return `challengeReturned=true`.
  - Public environments must not return a challenge solely because credentials are absent.

## Relationships

- `DeploymentContext` determines whether `BasicAuthCredential` evaluation is required.
- `BasicAuthCredential` evaluation produces an `AccessDecision`.
- `AccessDecision` controls whether the request continues to route handling or returns an auth challenge immediately.

## State Transitions

1. A request arrives and deployment context is resolved.
2. If the request is for a public environment, it proceeds without credential checks.
3. If the request is for the protected staging environment, credentials are parsed and compared.
4. Missing, malformed, or invalid credentials return an auth challenge.
5. Valid staging credentials allow the original request flow to continue.
