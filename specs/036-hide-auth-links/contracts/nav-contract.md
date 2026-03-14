# Navigation Contract

## Purpose
Document how the main navigation should behave relative to authentication state so future changes keep desktop and mobile menus consistent.

## Contract Elements

- **Input:** `authenticated:boolean`, derived from `state.user.value.data?.authenticated === true`.
- **Shared Source:** The nav list is `getNavRoutes(authenticated)`—the same array populates both `.nav-links-inline` (desktop) and `.nav-links-mobile` (mobile menu).
- **Output:** The rendered `<li>` items must match the filtered routes exactly; when `authenticated === true`, auth-specific routes (`/login`, `/signup`) must be absent from both menus.
- **Regeneration:** Any change to `authenticated` (e.g., login, logout, session expiry) recomputes `getNavRoutes` so the visible items update immediately.

## Accessibility Considerations
- Removing links must not collapse the nav layout or hide other controls; items simply disappear and gaps close naturally.
- Mobile menus should reuse the same list to avoid partial filtering where only desktop respects the state.
