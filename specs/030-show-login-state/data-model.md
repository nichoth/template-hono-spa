# Data Model: Show login state

## Entities

### Session
- **Fields**:
  - `authenticated` (boolean): true when `/api/session` confirms a valid session.
  - `user` (object|null): present when authenticated, containing user metadata.
  - `session.expiresAt` (string): expiry timestamp of the current session.
- **Relationships**:
  - Has one `User` when authenticated; otherwise `user` is null.
- **Validation rules**:
  - Header logic only renders `logged in as <identifier>` when `authenticated === true` and `user.identifier` is a non-empty string.
  - All other states (false, null, missing fields) fall back to the anonymous label.
  - `session.expiresAt` is not read by this feature but ensures the session object includes expiry metadata for completeness.

### User
- **Fields**:
  - `identifier` (string): email or username to display in the header.
  - `displayName` (nullable string): present but unused for this feature.
  - `id` (string): internal identifier, not surfaced here.
- **Relationships**:
  - Belongs to the `Session` entity; only populated when `authenticated === true`.
- **Validation rules**:
  - Header code must guard against `identifier` being undefined (fall back to `anonymous`).
  - `displayName` and `id` remain untouched; this feature only consumes `identifier`.
