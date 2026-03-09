# Quickstart: Validate Reliable Local Dev Startup

## 1. Install dependencies

```bash
npm install
```

## 2. Start local dev server (no `public/` preparation)

```bash
npm start
```

## 3. Validate baseline behavior

- Confirm server starts successfully from clean checkout.
- Confirm `http://localhost:8888/` returns HTTP 200.
- Confirm response contains `<div id="root"></div>` (client-rendered shell, no server-side app render).

## 4. Validate startup resilience

- Confirm startup succeeds even when `public/` does not exist before launch.
- Confirm app still serves shell HTML and client script references.

## 5. Validate actionable failure message

- Send request with header `x-startup-prereq-fail: 1`.
- Confirm response includes `Startup prerequisite error:` and `Next step:`.

## 6. Run automated verification

```bash
HOME=/tmp npm test
```

## Expected Result

- `npm start` works without manual build-artifact prep.
- Server performs no app SSR.
- Startup failures are actionable.
