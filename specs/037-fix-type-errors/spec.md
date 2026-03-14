# Feature Specification: Fix Session Type Errors

**Feature Branch**: `037-fix-type-errors`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "Please fix type errors [Image #1]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Typed session payloads (Priority: P1)

As a developer maintaining the session response, when we build the authenticated payload, I must return every property declared in `AuthUser` (including `login_method`) so TypeScript compilation succeeds and downstream consumers like `login-status.ts` can safely access that data.

**Why this priority**: Build-time type errors prevent the project from compiling, so fixing the session contract is critical before anything else.

**Independent Test**: Run `npm run lint`/`npm test` and confirm the TypeScript compiler no longer flags `AuthUser` fields while also making sure `formatLoginStatus` still returns the expected string.

**Acceptance Scenarios**:

1. **Given** the database `users` table contains `login_method`, **When** `createAuthService` builds a session, **Then** the `user` object includes `login_method` so `AuthUser`’s required fields line up with the returned shape.
2. **Given** an authenticated client consumes `/api/session`, **When** it reads `session.user.login_method`, **Then** the API returns the stored method (passkey/password) without raising `Property 'login_method' is missing` errors.

---

### Edge Cases

- What happens when the backend query returns no `login_method` (null)? The code should gracefully fall back to `null` or a default value while keeping the object literal type satisfied.
- How does the login-status helper behave when `session.loginMethod` is `undefined`? It should still fall back to "unknown method" without additional compile errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `AuthUser` type exported by the auth service MUST include `login_method` so all consumers expect the field.
- **FR-002**: The database query used by `findSessionByToken` (and anywhere else returning `AuthUser`) MUST select `users.login_method` so the in-memory record matches the type definition.
- **FR-003**: `makeAuthenticatedSessionResponse` MUST populate both `user.login_method` and the top-level `loginMethod` property from the persisted column so TypeScript sees those fields as defined.
- **FR-004**: Any helper (e.g., `formatLoginStatus`) that reads `session.user` MUST narrow `session.authenticated === true` before touching optional properties to avoid union-type errors.
- **FR-005**: When the backend responds with `authenticated: false`, the response MUST not include `user.login_method`, matching the current union type and keeping `login_method` optional in that branch.

### Key Entities *(include if feature involves data)*

- **AuthUser**: Represents the logged-in user returned by `/api/session`, including `id`, `identifier`, `displayName`, `login_method`, and `status`.
- **SessionResponse**: The union type sent to the client (`authenticated` flag plus the `user`/`session` objects), which now includes `loginMethod` at the top level when authenticated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: TypeScript no longer reports `Property 'user' does not exist` or `Property 'login_method' is missing` errors when compiling the auth module and any dependent client files.
- **SC-002**: `npm run lint` and `npm test` finish cleanly with the updated session payload (no new lint or type errors introduced).
- **SC-003**: API consumers that destructure `session.user.login_method` receive either the stored string or `null` without runtime exceptions.
- **SC-004**: Manual or automated verification shows `formatLoginStatus` displays “logged in via …” when the backend provides a `loginMethod`, and “unknown method” when it doesn’t.

## Assumptions

- The `users` table already stores `login_method` for each account; if the value is missing it can default to `null` but the server must still emit the property to satisfy TypeScript.
- Downstream helpers like `formatLoginStatus` and nav controls will continue relying on the existing session contract, so we only need to adjust the auth service plus type definitions.
