# Feature Specification: Show Profile Info

**Feature Branch**: `035-show-profile-info`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "On the profile route, in the page body, please show all profile info, like the username/email, login method (passkey vs passsord), etc"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profile summary visibility (Priority: P1)

As an authenticated visitor, when I land on `/profile`, I should immediately see every field the server already knows about my account (identifier, display name, login method, and session expiry) rendered in the page body, so I can verify my login status at a glance.

**Why this priority**: This is the primary value the feature delivers—exposing the stored profile data that motivated the request—so without it the screen remains a stub that fails the business ask.

**Independent Test**: Load `/profile` with a seeded authenticated session, confirm the page shows labeled rows for identifier, display name, login method, and expiration that match `/api/session`.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and the client has the latest session signal, **When** the user opens `/profile`, **Then** the page body renders a profile card listing identifier, display name (if provided), login method (`passkey` or `password`), and session expiration timestamp with labels.
2. **Given** the same user logs in using a different method (e.g., switches from password to passkey) and refreshes `/profile`, **When** the new session is restored, **Then** the login method row updates to reflect the most recent method stored on the user record.

---

### User Story 2 - Status verification (Priority: P2)

As an authenticated user, I want the profile screen to report the same login method and session metadata that the server knows about so I can trust the app's view of my account.

**Why this priority**: Synchronization between UI and server state prevents confusion about which credentials are active, which is essential for any account management scenario.

**Independent Test**: After changing the login method server-side (e.g., by adding/removing a passkey), triggering a session refresh should surface the new method in the profile card without manual edits.

**Acceptance Scenarios**:

1. **Given** the backend now records `login_method = 'passkey'` for a user, **When** the session is refreshed and `/profile` renders, **Then** the login method row shows `Passkey` and the identifier row remains unchanged.

---

### User Story 3 - Graceful defaults (Priority: P3)

As a user who might have incomplete metadata (missing display name or login method), I want sensible fallbacks displayed so the profile screen never appears broken.

**Why this priority**: Some accounts created before the login method flag existed may lack the new attribute, so gracefully handling blanks avoids presenting empty placeholders.

**Independent Test**: Using a legacy session where `displayName` or `loginMethod` is undefined, verify `/profile` renders `Display name: (not set)` and `Login method: Unknown`.

**Acceptance Scenarios**:

1. **Given** a session response where `displayName` is null, **When** `/profile` renders, **Then** the display name row shows `(not set)`.
2. **Given** the recorded login method is absent, **When** `/profile` renders, **Then** the login method row reads `Unknown method` and an accessibility hint explains the data is unavailable.

---

### Edge Cases

- What happens when the session signal is stale (e.g., logout occurred elsewhere)? The page should hide the profile card and prompt the user to log in again using the existing stub content.
- How does the UI behave if the server returns a malformed expiration timestamp? The row should fallback to `Expires: Unknown` while logging a client-side warning for diagnostics.
- How do we communicate login-method changes that happen mid-session? The profile view respects whatever `State.user` currently contains, so refreshing the session (e.g., via a reload) is required to see updates.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The user record persisted in the auth database MUST include a definite `login_method` attribute with values of `passkey` or `password` so the backend can declare how each account authenticates.
- **FR-002**: The `/api/session` endpoint MUST include the `loginMethod` field alongside `user.identifier`, `user.displayName`, and `session.expiresAt`, derived directly from the user record, without adding extra round trips.
- **FR-003**: The client-side `SessionResponse` contract and associated signals MUST include `loginMethod` so `State.restoreSession` (and future session refreshes) atomically capture the login method alongside the existing payload.
- **FR-004**: The `/profile` route MUST render all available profile attributes from `state.user.data` (identifier, display name, login method, session expiry) with clear labels and accessible descriptions in the page body whenever `state.user.data?.authenticated === true`.
- **FR-005**: When any of the profile attributes are absent, the profile row MUST render a fallback string (e.g., `(not set)` or `Unknown method`) and use `aria-live` or similar hints to keep screen readers informed.

### Key Entities *(include if feature involves data)*

- **UserProfile**: Represents the authenticated account stored in the DB with `id`, `identifier`, `displayName`, `status`, and the new `login_method` attribute that tracks whether the account uses passkeys or passwords.
- **SessionSnapshot**: Represents the current session info (authentication flag and `session.expiresAt`) returned by `/api/session`, which now carries `user: UserProfile` plus the bounding field `loginMethod` for UI display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authenticated visits to `/profile` display labeled rows for identifier, display name, login method, and session expiration within 1 second of navigation, as verified by manual QA or automated regression.
- **SC-002**: Profile content matches `/api/session` on every recorded login method in at least 3 manual test passes (password-only account, passkey-only account, account missing the field) with no mismatches allowed.
- **SC-003**: No automated accessibility scans flag missing labels or live-region updates for the profile card when the `loginMethod` value is unknown; fallbacks must keep the semantic structure intact.
- **SC-004**: Support tickets referencing “profile page shows blank data” decrease to 0 within the sprint, demonstrating that users can now see their stored metadata.

## Assumptions

- The auth database already stores, or can store with this feature, the `login_method` column; adding it will not require a broader schema migration beyond the auth tables already in play.
- `State.user` remains the single source of truth for profile details, meaning no separate `/api/profile` fetch is needed once `/api/session` exposes the extra field.
- All login methods besides `passkey` and `password` (e.g., future SSO) are out of scope for this change; any new method will be surfaced once the flag supports it later.
