# Contract: `/api/session` response (profile summary)

## Response shape (JSON)

- `user` (object|null)
  - `identifier`: `string` (email or username displayed on the profile card).
  - `displayName`: `string|null` (unused by this feature).
- `loginMethod`: `string` (e.g., `Passkey`, already shown in the card).
- `session` (object)
  - `expires`: `string` (ISO timestamp for the current session expiration, required for the `Session Expires` line).

## Invariants

- The profile view should treat a missing `session.expires` field as an intentional absence and render the fallback text `Session Expires not available`.
- When `session.expires` exists, format it once into the `YYYY-MM-DD, h:mmam/pm` pattern before rendering; downstream UI should not expose raw ISO strings or partially parsed timestamps.
- The UI relies on this endpoint continuing to include the same `user.identifier` and `loginMethod` fields, so any future contract changes must be coordinated with the profile component owner.
