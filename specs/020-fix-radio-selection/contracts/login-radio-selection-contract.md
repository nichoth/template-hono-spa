# Contract: Login Radio Selection

## Purpose

Define the expected user-facing behavior of the `/login` route when passkey and password are selected through the shared radio-input control.

## Contract Rules

1. The login screen must present passkey and password within one radio-input selector group.
2. Clicking a radio option once must visibly select that option on the same interaction.
3. The visible selected indicator must always match the route’s current login method state.
4. Selecting passkey must immediately activate the passkey path without requiring password fields.
5. Selecting password must immediately activate the identifier-and-password path.
6. Validation messages or submit feedback must not cause the selector to show a stale selected option.
7. The selector must continue using the shared radio-input control and stylesheet.
8. Switching between options must not require leaving `/login`.

## Covered Surfaces

- Login route behavior in [/Users/nick/code/template-hono-spa/src/client/routes/login.ts](/Users/nick/code/template-hono-spa/src/client/routes/login.ts)
- Login route presentation in [/Users/nick/code/template-hono-spa/src/client/routes/login.css](/Users/nick/code/template-hono-spa/src/client/routes/login.css)
- Shared radio-input stylesheet import in [/Users/nick/code/template-hono-spa/src/style.css](/Users/nick/code/template-hono-spa/src/style.css)
- Regression coverage in [/Users/nick/code/template-hono-spa/test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and [/Users/nick/code/template-hono-spa/test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts)

## Verification

- Automated tests should verify the selector is present, the shared radio-input control remains in use, and method selection updates visibly after one click.
- Manual review should confirm that no second click is needed to see the selected radio option change.
- Automated and manual review should confirm the selected method and the visible login content remain synchronized after interaction and feedback states.
