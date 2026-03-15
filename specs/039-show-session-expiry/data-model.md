# Data Model: Show session expiration on profile

## Entities

### Session
- **Fields**:
  - `expires` (ISO date-time string): expiration timestamp attached to the user session returned by `/api/session`.
  - `identifier` (string): current user identifier, already displayed elsewhere on the profile card.
  - `loginMethod` (string): passkey/login indicator currently shown next to the identifier.
- **Relationships**:
  - Drives the `Profile Summary` entity by supplying the metadata the UI renders; the same session object already powers the identifier and login method rows.
- **Validation rules**:
  - The expiration formatter must guard against missing or unparsable `expires` values and fallback to the defined copy.
  - When `expires` is present, convert it to the `YYYY-MM-DD, h:mmam/pm` string before rendering; do not accept raw ISO strings in the UI.
  - Refresh the expiration value whenever the session object is refreshed so the UI never shows stale guidance.

### Profile Summary
- **Fields**:
  - `identifier` (string): displayed at the top of the card.
  - `loginMethod` (string): indicates passkey or other login style.
  - `displayName` (string, if present): optional, not mutated by this feature.
  - `sessionExpires` (string): new text appended to the card, either the formatted expiration or the fallback copy.
- **Relationships**:
  - Renders the `Session` metadata in visual rows, so the termination and fallback logic must align with the existing layout.
- **Validation rules**:
  - The `Session Expires` row must stay within the same DOM/visual structure as the adjacent rows to preserve focus order and accessibility semantics.
  - When `sessionExpires` is the fallback copy, it should appear as a plain label/value pair to match the rest of the card (no extra emphasis or color changes).
