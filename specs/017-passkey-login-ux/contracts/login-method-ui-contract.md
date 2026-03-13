# Contract: Login Method UI

## Purpose

Define the expected user-facing behavior of the `/login` route when both passkey and password sign-in methods are available.

## Contract Rules

1. The login screen must show both sign-in methods on the same route.
2. The passkey path must be available as a direct action, not only as a low-context selector state.
3. The password path must remain visible and available as a fallback.
4. Exactly one sign-in method may be visually active at a time.
5. Password-specific fields must only appear required when the password path is active.
6. If a passkey attempt cannot continue, the screen must keep the password path available without redirecting away from `/login`.
7. The current route copy and primary action text must help the user infer which sign-in method is active.
8. A method-toggle control may be present, but it must reinforce the active path rather than replace the direct passkey action.

## Covered Surfaces

- Login route behavior in [/Users/nick/code/template-hono-spa/src/client/routes/login.ts](/Users/nick/code/template-hono-spa/src/client/routes/login.ts)
- Login route presentation in [/Users/nick/code/template-hono-spa/src/client/routes/login.css](/Users/nick/code/template-hono-spa/src/client/routes/login.css)
- Login route regression coverage in [/Users/nick/code/template-hono-spa/test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and [/Users/nick/code/template-hono-spa/test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts)

## Verification

- Automated tests should verify that passkey UI entry is present, password fallback remains available, and the active method state is reflected in route behavior or source structure.
- Manual review should confirm users can tell which sign-in method is active without relying on technical knowledge of passkeys.
