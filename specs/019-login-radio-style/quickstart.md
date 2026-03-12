# Quickstart: Login Radio Style

## Prerequisites

- Install dependencies in the repository root
- Work from branch `019-login-radio-style`

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

3. Confirm the login screen shows passkey and password in a single `radio-input` selector that visually aligns with the referenced create-account pattern.
   - Expect the selector to use the shared radio styling rather than bordered button-like boxes around each option

4. Compare the selector to the reference expectations.
   - Expect both options to sit together as one group
   - Expect spacing and placement to feel consistent with the shared control family
   - Expect the selected option to be obvious without hiding the inactive option

5. Leave or switch the selector to passkey.
   - Expect passkey guidance and the passkey action to remain the active path
   - Expect password-specific required states not to appear

6. Switch the selector to password.
   - Expect the identifier and password fields to become the active controls
   - Expect the selector to remain visible above the method-specific content

7. Trigger a passkey-unavailable or passkey-cancelled state if the UI models one.
   - Expect the password option to remain visible in the same selector as fallback

## Validation Log

- 2026-03-12: Planning artifacts prepared for the login radio-style refinement.
- 2026-03-12: Login selector updated to rely on the shared radio-input styling and simplified route-specific spacing.
- 2026-03-12: Manual browser validation was not executed in this terminal session.
- 2026-03-12: Automated verification completed with `npm run lint` and `HOME=/tmp npm test`.
