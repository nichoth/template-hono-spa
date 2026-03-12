# Contract: Login Radio Selector

## Purpose

Define the expected user-facing behavior of the `/login` route when passkey and password are selected through a radio-button control.

## Contract Rules

1. The login screen must show passkey and password within one radio-button control group.
2. The radio options must be mutually exclusive, with exactly one selected at a time.
3. Selecting passkey must activate the passkey path without making password fields appear required.
4. Selecting password must activate the identifier-and-password path.
5. The password option must remain visible as fallback if a passkey attempt cannot continue.
6. The radio selector and surrounding login content must reflect the active sign-in method clearly.
7. Switching between options must not require navigating away from `/login`.

## Covered Surfaces

- Login route behavior in [/Users/nick/code/template-hono-spa/src/client/routes/login.ts](/Users/nick/code/template-hono-spa/src/client/routes/login.ts)
- Login route presentation in [/Users/nick/code/template-hono-spa/src/client/routes/login.css](/Users/nick/code/template-hono-spa/src/client/routes/login.css)
- Login route regression coverage in [/Users/nick/code/template-hono-spa/test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and [/Users/nick/code/template-hono-spa/test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts)

## Verification

- Automated tests should verify the radio selector is present, selection state drives the active login controls, and password fallback remains available after passkey issues.
- Manual review should confirm the selector matches the expected radio-button interaction pattern from the reference example.
- The implemented selector should use the installed `@substrate-system/radio-input` element for both method options.
