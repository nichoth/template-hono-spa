# Research: Dedicated Signup Route

## Decision 1: Keep signup and login as separate client routes

**Decision**: Implement `/signup` as a dedicated route instead of reintroducing inline account creation on `/login`.

**Rationale**: The feature spec explicitly separates new-account creation from existing-account sign-in. A dedicated route keeps the mental model simple, matches the requested screenshots, and avoids carrying hidden account-creation state inside the login screen.

**Alternatives considered**:
- Re-add inline account creation to `/login`: rejected because it reverses the recent cleanup and violates the sign-in-only requirement for the login route.
- Open signup in a modal from `/login`: rejected because the requested behavior is route-based and should support direct navigation to `/signup`.

## Decision 2: Reuse the existing registration API endpoints for signup submission

**Decision**: Route signup submission through the existing `/api/auth/register/start` and `/api/auth/register/finish` backend flow instead of inventing a parallel account-creation API.

**Rationale**: The current backend already persists users, credentials, challenges, and sessions for passkey registration. Reusing it keeps account creation distinct from login while avoiding duplicate auth logic and schema changes that are unrelated to this feature.

**Alternatives considered**:
- Create a second set of registration endpoints just for `/signup`: rejected because it duplicates backend behavior without adding user value.
- Submit signup through the login endpoints: rejected because the spec requires account creation to use a distinct path from sign-in.

## Decision 3: Mirror the shared radio-selector pattern between login and signup

**Decision**: Build the signup method switcher with the same `radio-input` selector pattern already used on the login route.

**Rationale**: The feature requires a visually consistent method selector across both screens. Reusing the same pattern reduces UX drift and makes testing selection-state behavior simpler.

**Alternatives considered**:
- Use different controls on signup: rejected because it would break the requested visual match.
- Abstract both routes into one fully shared form now: rejected because the immediate need is parity in behavior and layout, not a larger refactor.

## Decision 4: Keep password signup presentational unless a real backend path already exists

**Decision**: The signup route should present password as a selectable method to match the requested control, but implementation should only activate a real submission path if the existing backend already supports it.

**Rationale**: The current backend clearly supports passkey-backed registration. The spec requires the selector and state behavior, but does not require inventing a complete password-account backend inside this route feature if one is not already available.

**Alternatives considered**:
- Hide the password option entirely: rejected because the requested screenshots show both options.
- Promise full password account creation regardless of backend support: rejected because it would expand scope beyond the current auth design without an explicit product requirement.
