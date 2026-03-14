# Feature Specification: Show login state

**Feature Branch**: `[030-show-login-state]`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "I would like to show the login state for the user. In the app header, should add a bit of text to the left of the avatar image that says logged in as <email> or anonymous [Image #1]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirm authenticated user (Priority: P1)

An authenticated desktop user wants to see which account is active so they can be confident their session is recognized before interacting with account-level features.

**Why this priority**: Showing the email next to the avatar is the primary benefit requested and prevents accidental actions under the wrong account.

**Independent Test**: Sign in via the existing login flow, wait for the `/api/session` response to return `authenticated:true`, then refresh or navigate to the home screen on a desktop viewport and verify the header text reads `logged in as <email>`.

**Acceptance Scenarios**:

1. **Given** the session response includes `authenticated:true` and `user.identifier` (email), **when** the desktop header renders, **then** the text between the nav and avatar reads `logged in as <email>`.
2. **Given** the user clicks the avatar, **when** the login state text is present, **then** the avatar link still navigates to `/profile` without interference.

---

### User Story 2 - Provide anonymous fallback (Priority: P2)

A visitor who is not signed in should still see the descriptor so they know they are browsing anonymously.

**Why this priority**: Without this fallback, the new text could be blank or show stale data, which would be confusing; this story keeps the experience consistent for unsigned visitors.

**Independent Test**: Load the app in a fresh browser or after clearing the session, confirm `/api/session` returns `authenticated:false` (or errors), and verify the header text says `logged in as anonymous` on desktop.

**Acceptance Scenarios**:

1. **Given** the session request resolves to `authenticated:false` or the request fails, **when** the desktop header renders, **then** the status text shows `logged in as anonymous`.

---

### User Story 3 - Preserve mobile header layout (Priority: P3)

Mobile users need the current compact header, so any additional text should be hidden below the desktop breakpoint.

**Why this priority**: Mobile screens are constrained; showing the extra text would disrupt spacing and possibly wrap the header.

**Independent Test**: Resize the browser to a mobile width (e.g., 640px) or use a mobile device, load the page, and confirm the login text is hidden while the avatar and nav remain unchanged.

**Acceptance Scenarios**:

1. **Given** the viewport width is below the desktop breakpoint (approximately 680px), **when** the header renders, **then** the login status element is not visible.

---

### Edge Cases

- What happens when the session response is delayed or pending? Ensure the header displays `logged in as anonymous` until the promise resolves.
- How does the header behave if the session response is missing the `user.identifier` field? Fall back to `anonymous` in that case.
- How does the text resizing respond to scaled text settings? Keep the font at least 1rem so browser zooming does not make it unreadable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Desktop header MUST display `logged in as <email>` when `state.user` reflects an authenticated session with a non-empty `user.identifier`.
- **FR-002**: Desktop header MUST display `logged in as anonymous` when `state.user` indicates the session is unauthenticated, pending, or the identifier is missing.
- **FR-003**: The indicator MUST appear between the navigation links and the avatar without overlapping the avatar link or changing the existing navigation behavior.
- **FR-004**: The login status text MUST use the same color as the nav links, maintain a font size of at least 1rem, and sit flush with the header spacing so it feels like part of the existing layout.
- **FR-005**: The login status element MUST be hidden on viewports narrower than ~680px (mobile) to avoid altering the compact mobile header.

### Key Entities *(include if feature involves data)*

- **Session**: The response from `/api/session` that includes `authenticated` (boolean), `user` (with `identifier`, `displayName`, `id`), and `session.expiresAt`; the header reads from this entity to decide what text to render.
- **User**: The authenticated account with `identifier` (email or username) used to personalize the header text and confirm account identity for the user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When an authenticated session is restored on a desktop viewport, the header text reads `logged in as <identifier>` within one second of hydration (can be visually confirmed in dev tools or a screenshot).
- **SC-002**: When the user is unauthenticated, pending, or the identifier is missing, the desktop header text clearly says `logged in as anonymous`.
- **SC-003**: When the viewport width is below the desktop threshold (~680px), the login status text remains hidden so the header reverts to its prior compact appearance.
- **SC-004**: The login status text uses a font size of at least 1rem and matches the nav link color, ensuring legibility and visual cohesion as validated by a style inspection.
