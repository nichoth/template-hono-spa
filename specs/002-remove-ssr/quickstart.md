# Quickstart: Validate Client-Only Rendering

## 1. Install dependencies

```bash
npm install
```

## 2. Start local development server

```bash
npm start
```

## 3. Validate client-only shell response

- Request the primary page route.
- Confirm HTML includes mount container and client script references.
- Confirm HTML does not include server-rendered application UI content.

## 4. Validate route behavior

- Check additional app routes (for example `/about`).
- Confirm each targeted route follows client-shell-only behavior.

## 5. Validate startup diagnostics

- Trigger a startup prerequisite failure scenario.
- Confirm output includes clear cause and concrete remediation step.

## 6. Run automated tests

```bash
HOME=/tmp npm test
```

## Expected Result

- App routes use client-only rendering.
- Local startup remains reliable.
- Diagnostic messages remain actionable.

## Validation Record (2026-03-09)

- `HOME=/tmp npm test` -> PASS (2 files, 17 tests)
- `npm start` smoke check -> PASS (HTTP 200 at `/`; shell response contains `<div id="root"></div>` and client module script)
