# Hide auth links design

## Overview
- Purpose: Remove the Login and Create Account links from the desktop header once a user is authenticated while leaving the shared navigation items (Home, About, etc.) in place.
- Scope: Only the desktop nav needs adjustment; mobile navigation already follows the same link list and will inherit filtering.

## Layout & Styling
- Keep the existing nav markup but filter the `routes` array in `src/client/components/nav.ts` so that `Login` and `Create Account` entries are omitted when `state.user.value.data?.authenticated === true`.
- No additional styling is required beyond the filtered list, ensuring the header retains its current spacing and alignment.

## Data & Interaction
- Use the restored session (`state.user`) to determine authentication state; if `authenticated` is true, suppress the auth links in both the desktop and mobile menus.
- Ensure the user still sees Home/About even when authenticated.
- Because the nav links are generated from the shared `routes` list, filtering there keeps the logic centralized and automatically applies to all menu renderers (desktop, mobile, nav components).

## Testing & Validation
- On desktop, sign in and reload the home page, confirming only Home/About (and other non-auth links) remain; the Login/Create Account links should be absent.
- On anonymous visits, verify the full link set appears.
- Run the existing navigation-focused Vitest tests (and any new unit tests if created) to ensure the filtered collection renders as expected for both authenticated and anonymous states.
