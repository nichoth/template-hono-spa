# Feature Specification: Hide auth links

**Feature Branch**: `[031-hide-auth-links]`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "When you are logged in, the Login and Create Account links should not exist in the header. [Image #1]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated header cleanliness (Priority: P1)

An authenticated user wants the header to reflect their session by removing the Login and Create Account links so only the navigation options that remain relevant are visible.

**Why this priority**: Authenticated users can be confused by links that lead back to the sign-in/sign-up flows, so hiding them reinforces the current state and prevents redundant clicks.

**Independent Test**: Sign in via the existing authentication flow, refresh or navigate the home page on desktop, and confirm the navigation only lists non-auth routes (e.g., Home, About) while Login and Create Account are absent.

**Acceptance Scenarios**:

1. **Given** the session response reports `authenticated:true`, **when** the navigation renders, **then** the Login/Create Account entries are omitted.
2. **Given** the user interacts with any desktop nav item while signed in, **when** they inspect the menu, **then** no auth links are present and other items remain untouched.

---

### User Story 2 - Anonymous navigation availability (Priority: P2)

An anonymous visitor needs access to the Login and Create Account links so they can authenticate or register.

**Why this priority**: Removing the auth links for anonymous visitors would block their ability to sign in or sign up, so they must remain visible until the session resolves to authenticated.

**Independent Test**: Open the app in a fresh browser or incognito window, confirm `/api/session` returns `authenticated:false` or is pending, and verify the navigation includes Login and Create Account.

**Acceptance Scenarios**:

1. **Given** the session response is `authenticated:false` (or not yet resolved), **when** the navigation renders, **then** Login and Create Account appear alongside the other nav entries.

---

### User Story 3 - Responsive parity (Priority: P3)

The filtered navigation must apply to both the desktop and mobile menus so authenticated users enjoy consistent behavior on every device.

**Why this priority**: The nav data is shared across desktop and mobile renderers; filtering once prevents duplication and ensures the same links hide regardless of viewport.

**Independent Test**: Sign in, shrink the viewport below the mobile breakpoint, open the mobile menu, and confirm only the non-auth entries are shown there as well.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and the viewport is narrow, **when** the mobile nav opens, **then** Login and Create Account remain hidden just like on desktop.

---

### Edge Cases

- What happens while the session request is pending? Keep the Login/Create Account links visible until the session resolves to `authenticated:true`.
- How does the nav react if the session toggles between authenticated and anonymous? The header should re-render after `state.user` updates so the links appear/disappear accordingly.
- What if new navigation items are added? Filtering should target only the entries named Login and Create Account so other links are unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Whenever `state.user.value.data?.authenticated === true`, the navigation rendering MUST omit the Login and Create Account entries.
- **FR-002**: When the session is unauthenticated, pending, or missing, the navigation MUST include Login and Create Account alongside the other items.
- **FR-003**: The filtering MUST operate on the shared `routes` collection so desktop, mobile, and any future nav renderers remain consistent.
- **FR-004**: The filtering logic MUST only remove auth links and leave other navigation entries untouched.
- **FR-005**: The nav MUST re-render and refresh the filtered list whenever the session signal changes state.

### Key Entities *(include if feature involves data)*

- **Session**: The `/api/session` response carrying `authenticated` and `user` data that the header watches to decide if it should hide auth links.
- **Navigation route**: A record from `src/client/routes/index.ts` describing nav items (text, href); the filtering should drop only the auth-specific entries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated desktop sessions display navigation without Login/Create Account within one render cycle after the session resolves.
- **SC-002**: Anonymous sessions continue to show Login/Create Account so the auth flows remain reachable.
- **SC-003**: Mobile navigation mirrors the desktop filtering for authenticated users within the mobile breakpoint.
- **SC-004**: Nav visibility changes are driven exclusively by session state transitions, preventing unrelated events from toggling auth links.
