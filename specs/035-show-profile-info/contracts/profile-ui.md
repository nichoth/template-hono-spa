# `/profile` UI Contract

## Purpose
Describe how the profile route renders the session data so future contributors understand the required structure, labels, and accessibility behavior.

## Rendering Expectations
- The page displays a `route profile` container with a heading, a card of labeled rows, and the logout controls already present.
- Each profile row must include:
  1. A label (e.g., “Identifier”, “Display Name”, “Login Method”, “Session Expires”).
  2. A corresponding data value derived from `State.user.value.data`.
  3. A fallback string when data is missing (`(not set)` for display names, `Unknown method` for login methods, `Expires: Unknown` for timestamps).
- The `Login Method` row must display the humanized form of the enum (`Passkey` or `Password`) and fallback to `Unknown method with screen-reader hint if the flag is absent.
- Fallback text changes must be exposed to assistive technology using `aria-live` or label updates so the UI remains accessible.

## Data Bindings
- `identifier` → `state.user.value.data.user.identifier`
- `displayName` → `state.user.value.data.user.displayName`
- `loginMethod` → `state.user.value.data.loginMethod`
- `session expiresAt` → `state.user.value.data.session.expiresAt`

## Error and Staleness Handling
- When `state.user` shows `authenticated === false`, the profile card is not rendered and the existing stub copy prompts login instead.
- If `loginMethod` or `session.expiresAt` is null/undefined, the UI renders the fallback strings without throwing.
