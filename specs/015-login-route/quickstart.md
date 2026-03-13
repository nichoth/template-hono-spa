# Quickstart: Login Route

## Prerequisites

- Install dependencies in the repository root
- Work from branch `015-login-route`

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

3. Confirm the page shows:
   - A login heading
   - A username-or-email field
   - A password field
   - A submit button

4. Submit the form with both fields empty.
   - Expect the route to stay on `/login`
   - Expect visible validation guidance for the required fields

5. Enter one field only and submit again.
   - Expect the completed value to remain
   - Expect only the missing field to require correction

6. Enter both fields and submit.
   - Expect the route to stay on `/login`
   - Expect an informational message that login processing is not connected
   - Expect no redirect or authenticated-session behavior

7. Open another existing route such as `http://127.0.0.1:8888/about`.
   - Expect existing route rendering to remain unchanged

## Validation Log

- 2026-03-11: `npm run lint` passed from `/Users/nick/code/template-hono-spa`
- 2026-03-11: `HOME=/tmp npm test` passed from `/Users/nick/code/template-hono-spa` with 45 tests passing
- 2026-03-11: Live dev-server HTTP checks passed for `/login` and `/about` on Vite port `8893`; both routes returned the expected app shell HTML
- 2026-03-11: Browser-only interaction steps were not executed directly in this terminal environment; local form behavior is covered by the automated route tests in `test/unit.spec.ts`
