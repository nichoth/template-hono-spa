# Data Model for Hide Auth Links

## NavigationRoutes
- **Description:** The canonical list of routes rendered across desktop and mobile menus, produced by `getNavRoutes(authenticated:boolean)`.
- **Fields:**
  - `href` (string): Client-side path for each nav link.
  - `text` (string): Human-readable label shown to visitors.
  - `isAuthLink` (boolean, optional): Flag that indicates the link is only relevant for unauthenticated visitors and should be filtered out when `authenticated === true`.
- **Validation rules:** The nav list must include home/about and optional auth links; any `isAuthLink` true entries are excluded when `authenticated` folds to true.
- **Relationships:** Both `nav.ts` and the mobile menu share this entity, guaranteeing identical menu items regardless of viewport size.

## AuthenticationState
- **Description:** Derived view of `state.user.value.data` that drives visibility of auth links.
- **Fields:**
  - `authenticated` (boolean): Whether the current session is signed in.
  - `user.identifier` (string | null): The logged-in identifier shown in the header.
- **State transitions:** This state updates when:
  1. The app restores a session (`State.restoreSession`).
  2. The user logs in or out.
  3. Logout or session expiration sets `authenticated` back to false.
- **Usage:** Nav rendering logic computes `getNavRoutes(authenticated)` every render so menu entries follow the current `AuthenticationState`.
