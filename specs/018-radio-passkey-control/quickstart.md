# Quickstart: Radio Passkey Control

## Prerequisites

- Install dependencies in the repository root
- Work from branch `018-radio-passkey-control`

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

3. Confirm the login screen shows the `@substrate-system/radio-input` selector with both passkey and password options visible together.

4. Select the passkey radio option.
   - Expect the passkey path to become active
   - Expect password-specific fields not to appear required
   - Expect the passkey action to remain visible

5. Select the password radio option.
   - Expect the identifier and password fields to become the active controls
   - Expect the passkey option to remain visible in the same selector

6. Trigger a passkey-unavailable or passkey-cancelled state if the UI models one.
   - Expect the password option to remain available as fallback in the same radio selector

## Validation Log

- 2026-03-12: Planning artifacts prepared for the radio-button passkey/password selector.
- 2026-03-12: Login route updated to use `@substrate-system/radio-input` for the passkey/password selector.
- 2026-03-12: Manual browser validation was not executed in this terminal session.
- 2026-03-12: Implementation verification remains pending until code changes are made.
