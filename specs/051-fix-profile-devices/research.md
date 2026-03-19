# Research: Profile Device List Visibility

## Decision 1: Load devices from authenticated session state, not a one-shot truthiness hook

**Decision**: Move device-list loading to an authenticated-session-driven path so the request runs after session restoration resolves and can re-run when auth state changes.

**Rationale**: `State()` currently uses `when(state.user, () => State.listDevices(state))`. The local `when()` helper disposes after the first truthy signal value, and `state.user` starts as a truthy `RequestState()` object. That means the device request can run before `State.restoreSession()` finishes and never re-run once the authenticated session is known. Tying the fetch to authenticated session resolution removes that race and matches the user-visible contract for `/profile`.

**Alternatives considered**:
- Keep the one-shot hook and make the initial state falsey: rejected because it couples the fix to `RequestState()` internals and still handles only one transition.
- Fetch devices only inside `ProfileRoute`: rejected because it scatters auth/data bootstrapping and makes later device refresh behavior less consistent.

## Decision 2: Treat loading, empty, and error as explicit profile view states

**Decision**: Keep the device request state as the source of truth and render explicit loading, empty, and error messages in the `/profile` device section.

**Rationale**: `profile.ts` already renders loading and populated states, but when the list is empty or the request fails it falls through to silence. That silent blank area is indistinguishable from the reported regression. Explicit states satisfy the spec requirements and make failures diagnosable without developer tools.

**Alternatives considered**:
- Keep the current blank fallback: rejected because it masks failures and violates the feature’s acceptance criteria.
- Collapse empty and error into one generic message: rejected because it reduces supportability and weakens regression diagnostics.

## Decision 3: Preserve the existing device API contract and fix behavior in the client layer

**Decision**: Keep `/api/auth/passkey/devices` response shape unchanged and solve the regression in client state loading and rendering.

**Rationale**: The worker endpoint already returns the authenticated user’s devices, including `deviceId`, `credentialName`, timestamps, and revocation status. The service layer also returns device data scoped by user. The strongest evidence points to a client-side bootstrap problem rather than an API contract gap, so the plan should avoid unnecessary server churn.

**Alternatives considered**:
- Change the endpoint payload or add a new profile bootstrap endpoint: rejected because the current contract already contains the fields the UI needs.
- Filter server responses to active devices only as part of this fix: rejected because it changes existing behavior unrelated to the reported blank-list bug.

## Decision 4: Add regression coverage at both state and user-visible boundaries

**Decision**: Extend tests at the client-state layer and at the app/integration layer.

**Rationale**: The failure originates in client bootstrap timing, but the acceptance criteria are user-visible on `/profile`. One test layer alone would miss part of the behavior: state tests can confirm the fetch sequence, while integration or route rendering tests confirm the user can actually see the current device and explicit empty/error states.

**Alternatives considered**:
- Manual verification only: rejected because this is a regression-prone auth/device-management path.
- Server-only tests: rejected because they would not detect the client timing bug that caused the blank UI.
