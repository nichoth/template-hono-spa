# Data Model: Staging Access Control

## Entity: DeploymentContext
- Description: Runtime classification of request environment.
- Fields:
  - `branchName` (string): Deployment branch identifier.
  - `environmentType` (enum): main, staging, preview, unknown.
  - `requiresAuth` (boolean): Whether request must pass basic auth.
- Validation rules:
  - `requiresAuth` must be false for `main`.
  - `requiresAuth` must be true for non-main deploy types in scope.

## Entity: BasicAuthCredential
- Description: Parsed credentials from request authorization header.
- Fields:
  - `username` (string | null): Supplied username if parse succeeds.
  - `password` (string | null): Supplied password if parse succeeds.
  - `isMalformed` (boolean): Header parse validity.
- Validation rules:
  - Missing or malformed values are unauthorized for protected environments.

## Entity: AccessDecision
- Description: Final access-control outcome for a request.
- Fields:
  - `isAuthorized` (boolean): Whether request proceeds.
  - `challengeReturned` (boolean): Whether challenge response was emitted.
  - `decisionReason` (enum): main-allowed, credentials-valid, missing-auth, invalid-auth, malformed-auth.
- Validation rules:
  - Protected environments require `isAuthorized=true` only on valid credentials.
  - Unauthorized protected requests must return challenge behavior.

## Relationships
- `DeploymentContext` determines whether `BasicAuthCredential` evaluation is required.
- `BasicAuthCredential` evaluation produces an `AccessDecision`.

## State Transitions
1. Request arrives; deployment context is resolved.
2. If context is `main`, request is authorized without auth challenge.
3. If context is protected, credentials are parsed and validated.
4. Invalid/missing credentials yield challenge response; valid credentials allow normal request flow.
