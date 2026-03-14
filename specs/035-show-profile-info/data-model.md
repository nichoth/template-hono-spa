# Data Model for Show Profile Info

## UserProfile
- **Description:** Represents the authenticated account persisted in Cloudflare D1.
- **Fields:**
  - `id` (string, required): Primary identifier for joins and foreign keys.
  - `identifier` (string, required): Email or username shown to the user.
  - `displayName` (string, nullable): Optional friendly name displayed on the profile card.
  - `login_method` (enum: `passkey` | `password`, required): Indicates which credential type the user uses; this is the source of the login method row on `/profile`.
  - `status` (string, required): Legacy field retained for user health checks but not surfaced directly here.
- **Validation rules:** The `identifier` must be unique and non-empty. `login_method` must always be one of the two supported enum values; any legacy nulls are treated as “unknown” in the UI.
- **Relationships:** The `sessions` table references `user_id`, ensuring each session snapshot can include the associated profile attributes.

## SessionSnapshot
- **Description:** Represents the object returned by `/api/session` and consumed by `State.user`.
- **Fields:**
  - `authenticated` (boolean): Flags whether the current request is authenticated.
  - `user` (UserProfile, optional): Present only when authenticated is true.
  - `session.expiresAt` (ISO 8601 string, required when authenticated): Human-readable expiration used on the profile card.
  - `loginMethod` (UserProfile.login_method enum, replicated at the top level for clarity): Used directly by the profile UI without needing to traverse nested fields.
- **State transitions:** The session snapshot is updated when:
  1. The browser calls `/api/session` during `State.restoreSession`.
  2. The user performs login/logout, which regenerates the snapshot.
  3. Any backend mutation to the `users.login_method` field is picked up via a fresh `State.user` restoration.

## ProfileViewState (derived frontend entity)
- **Description:** Memoized view of the profile card extracted from the session snapshot.
- **Fields:** Mirrors `UserProfile` plus derived strings such as `displayName || '(not set)'`, `loginMethodLabel`, and `expiresAt || 'Unknown'`.
- **Validation rules:** Renders existing values verbatim; when values are missing, substitutes the fallback strings to keep labels visible and avoid layout collapse.
