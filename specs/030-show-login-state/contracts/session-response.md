# Contract: `/api/session` response (header consumption)

## Response shape (JSON)

- `authenticated`: `boolean`
  - `true`: header should display `logged in as <identifier>`.
  - `false`: header should show `logged in as anonymous`.
- `user`: `null` or object present when `authenticated` is `true`.
  - `identifier`: `string` (email or username) displayed in the header.
  - `displayName`: `string|null` (unused by header, reserved for other features).
  - `id`: `string` internal user id (unused here).
- `session`: object containing `expiresAt` (ISO string) describing expiry time.

## Invariants

- Header logic should treat missing `user` or `user.identifier` as anonymous, even when `authenticated` is `true`.
- Clients should expect this endpoint to be cached by the existing session management flow; no additional calls are required.
