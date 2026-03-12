# Quickstart: Fix Radio Selection

## Prerequisites

- Install dependencies in the repository root
- Work from branch `020-fix-radio-selection`

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

3. Click the password option once.
   - Expect the password option to become visibly selected immediately
   - Expect the identifier and password fields to become the active controls immediately

4. Click the passkey option once.
   - Expect the passkey option to become visibly selected immediately
   - Expect the passkey guidance and action to become active immediately

5. Repeat the selection changes several times.
   - Expect no state where the wrong option appears selected
   - Expect no need for a second click to make the radio selection visible

6. Trigger validation feedback or a passkey status message if the UI models one.
   - Expect the current selected option to remain visibly correct
   - Expect the content under the selector to remain synchronized with the selected method

## Validation Log

- 2026-03-12: Planning artifacts prepared for the radio-selection synchronization fix.
- 2026-03-12: Login selector updated so single-click radio-input changes and visible selection state stay synchronized.
- 2026-03-12: Manual browser validation was not executed in this terminal session.
- 2026-03-12: Automated verification completed with `npm run lint` and `HOME=/tmp npm test`.
