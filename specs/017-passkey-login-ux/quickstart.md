# Quickstart: Passkey Login UX

## Prerequisites

- Install dependencies in the repository root
- Work from branch `017-passkey-login-ux`

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

2. Open `http://127.0.0.1:8888/login`.

3. Confirm the first screen view makes both methods discoverable:
   - A passkey-first method toggle is active on first view
   - A direct "Continue with passkey" action is visible without opening another screen
   - A password sign-in path is also visible as fallback

4. Activate the passkey path.
   - Expect the next action to be obvious without requiring password entry
   - Expect the screen copy and controls to reflect that passkey is the current method

5. Switch to the password path.
   - Expect the identifier and password fields to become the active method controls
   - Expect the passkey path to remain available as an alternative

6. Trigger a passkey-unavailable or passkey-cancelled state if the UI models one.
   - Expect password sign-in to remain available on the same screen

## Validation Log

- 2026-03-12: Planning artifacts prepared for passkey login UX.
- 2026-03-12: `npm run lint` passed from `/Users/nick/code/template-hono-spa`.
- 2026-03-12: `HOME=/tmp npm test` passed from `/Users/nick/code/template-hono-spa` with 54 tests passing, including login-route passkey-first and password-fallback coverage.
- 2026-03-12: Manual browser validation was not executed in this terminal session.
