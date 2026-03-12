# Contract: Login Radio Style

## Purpose

Define the expected user-facing behavior of the `/login` route when the passkey and password selector is presented in the shared radio-control style shown in the references.

## Contract Rules

1. The login screen must show passkey and password within one persistent radio-style selector.
2. The selector must use the shared radio-control family represented by the reference pattern, including comparable grouping, spacing, and selected-state clarity.
3. The selector must keep exactly one option active at a time.
4. Selecting passkey must activate the passkey path without requiring password fields.
5. Selecting password must activate the identifier-and-password path.
6. The selector must remain visible while the method-specific content updates.
7. The password option must remain available as fallback if a passkey attempt cannot continue.
8. Switching between options must not require leaving `/login`.

## Covered Surfaces

- Login route behavior in [/Users/nick/code/template-hono-spa/src/client/routes/login.ts](/Users/nick/code/template-hono-spa/src/client/routes/login.ts)
- Login route presentation in [/Users/nick/code/template-hono-spa/src/client/routes/login.css](/Users/nick/code/template-hono-spa/src/client/routes/login.css)
- Radio-input registration in [/Users/nick/code/template-hono-spa/src/client/index.ts](/Users/nick/code/template-hono-spa/src/client/index.ts)
- Regression coverage in [/Users/nick/code/template-hono-spa/test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and [/Users/nick/code/template-hono-spa/test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts)

## Verification

- Automated tests should verify the selector remains present, the expected radio-input structure is intact, and the active method still controls the visible login path.
- Manual review should confirm the selector looks substantially aligned with the referenced create-account pattern in layout, spacing, and selected-state treatment.
- The implementation should continue using the installed radio-input custom element rather than replacing it with a separate selector control.
- The selector should rely on the shared radio-input styling plus route-specific spacing and copy updates, not on boxed button-like wrappers around each option.
