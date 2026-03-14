# Feature Specification: Hide Auth Links

**Feature Branch**: `036-hide-auth-links`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "When I am logged in, should not show the create account and login links in the top nav [Image #1]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated nav cleanup (Priority: P1)

As a signed-in user, when I visit any page, the main navigation should show only the routes that make sense for authenticated visitors, omitting the `Login` and `Create Account` links so the header reflects my session state and avoids offering redundant sign-in actions.

**Why this priority**: The requested change is purely visual but important for clarity—presenting login options to someone already signed in signals stale state and confuses the experience, so the navigation must adapt before anything else.

**Independent Test**: Authenticate locally (passkey or password) and observe the desktop/mobile nav—there should be no `Login` or `Create Account` entries, and the logout/profile controls remain accessible.

**Acceptance Scenarios**:

1. **Given** the user is authenticated (i.e., `state.user.value.data?.authenticated === true`), **When** the nav renders on desktop or mobile, **Then** only the non-auth links from `getNavRoutes(true)` appear and the `Login`/`Create Account` list items are absent from both nav menus.
2. **Given** the user logs out or the auth session expires, **When** the nav updates, **Then** the `Login` and `Create Account` links return so unauthenticated visitors can sign in.

---

### User Story 2 - Responsive menu sync (Priority: P2)

As a user who toggles the mobile menu, I want the hamburger menu options to match the authenticated nav list so that signing in/out (or refreshing the nav) always displays the correct set of links regardless of viewport.

**Why this priority**: The nav state is shared between desktop and mobile, so a fix is incomplete if only one menu respects authentication; both must stay in sync to avoid exposing login/create calls on small screens.

**Independent Test**: Sign in, open the mobile menu, and confirm `Login`/`Create Account` are missing; then log out and verify they reappear when the menu reopens.

**Acceptance Scenarios**:

1. **Given** the mobile hamburger is open and the user signs in, **When** the menu re-renders, **Then** it reuses the same `getNavRoutes(true)` list and hides the auth links.
2. **Given** the user is unauthenticated and the hamburger menu contains all nav entries, **When** they sign in, **Then** the menu list is filtered and `Login`/`Create Account` disappear without leftover placeholders.

---

### Edge Cases

- What if the auth signal updates slower than the nav render (e.g., during app bootstrap)? The nav should default to the unauthenticated route set until `state.user` proves the user is signed in, so duplicate auth links only disappear once the session state is confirmed.
- How does the nav behave during a failed login attempt? It should continue to show `Login`/`Create Account` because `state.user` never reached the authenticated state, avoiding flicker.
- What happens when the user uses the browser back button to an earlier auth state? The nav should re-evaluate `state.user` through the existing computed signal so the links reflect the current session each render.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The navigation component MUST derive its menu entries from `getNavRoutes(authenticated)` using the latest `state.user` signal so authenticated visitors never render the auth links.
- **FR-002**: Mobile and desktop menu renderings MUST share the same source list so toggling the hamburger menu does not bypass the authenticated filter.
- **FR-003**: Navigation updates triggered by login/logout or direct session changes MUST trigger recomputation of the visible routes, ensuring the link set swaps immediately after session changes.
- **FR-004**: The nav state MUST treat the absence of a confirmed authentication flag as unauthenticated, preventing login links from disappearing prematurely.
- **FR-005**: Logging out MUST restore the `Login` and `Create Account` entries before the user leaves the page, preserving the unauthenticated experience.

### Key Entities *(include if feature involves data)*

- **NavigationRoutes**: The list of routes returned by `getNavRoutes(authenticated:boolean)`, which controls the nav items for desktop and mobile menus.
- **AuthenticationState**: The computed session snapshot derived from `state.user.value.data`, including `authenticated` and `user.identifier`, that gatekeeps whether to render auth links.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of manual/accounting tests for authenticated browsers (desktop/mobile) show only non-auth links in the navigation within one render cycle after login.
- **SC-002**: The mobile hamburger menu and desktop nav list always contain the same number of items after login/logout transitions, as verified by UI regression checks.
- **SC-003**: No reported bug or support ticket mentions seeing login/create links while signed in after this deploy (target zero regressions for that message).
- **SC-004**: Navigation tests (manual or automated) confirm the `Login` and `Create Account` entries reappear within 1 second of logging out or losing the session.

## Assumptions

- The `state.user` signal correctly reflects the current authentication status shortly after login/logout, so the nav can reuse it without additional API calls.
- There are no other nav entries that must be hidden for authenticated users beyond `Login` and `Create Account`.
- The nav’s current list of static routes is the authoritative source for both desktop and mobile menus, so cascading updates from `getNavRoutes` keep both views synchronized.
