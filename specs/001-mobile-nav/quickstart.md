# Quickstart: Mobile Navigation

## Prerequisites

- Install dependencies in the repository root
- Work from branch `001-mobile-nav`

## Automated Validation

1. Run lint:

```sh
cd /Users/nick/code/template-hono-spa && npm run lint
```

2. Run the full test suite:

```sh
cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test
```

## Manual Validation

1. Start local development:

```sh
cd /Users/nick/code/template-hono-spa && npm start
```

2. Open the app on a mobile-sized viewport.

3. Confirm the header shows:
   - The mobile menu trigger in the top-right area
   - No inline primary navigation links in the mobile header before opening the menu

4. Activate the menu trigger.
   - Expect the primary navigation links to appear inside the mobile menu
   - Expect the current page to remain visually identifiable in the menu

5. Select a mobile navigation destination.
   - Expect the destination to load correctly
   - Expect the mobile navigation to avoid remaining visibly stuck open after navigation

6. Switch to a desktop-sized viewport.
   - Expect the inline navigation to remain visible in the header
   - Expect the desktop header not to require the mobile menu interaction

7. Verify at least two app routes such as `/` and `/about`.
   - Expect navigation access to remain intact in both viewport modes

## Validation Notes

- 2026-03-12: `HOME=/tmp npm test` passed with 50 passing tests after adding source-level and integration coverage for the mobile nav structure and client-shell routing.
- 2026-03-12: `npm run lint` passed after wiring `@substrate-system/hamburger-two` into the shared nav and bootstrap layers.
- 2026-03-12: Automated validation in this terminal confirmed the client shell still bootstraps `/`, `/about`, and `/login`.
- 2026-03-12: A real browser viewport check is still the right way to confirm visual placement of the hamburger in the top-right corner and the exact compact-screen menu presentation.
