# Quickstart: Validate Navigation JSX Rewrite

## 1. Install dependencies

```bash
npm install
```

## 2. Start local development server

```bash
npm start
```

## 3. Validate navigation behavior manually

- Load the app in a browser.
- Click each header navigation link and confirm destination content updates correctly.
- Confirm the active navigation item is visibly highlighted for the current path.

## 4. Validate edge behavior

- Load a path that does not match a configured nav item and confirm app shell remains intact.
- Confirm navigation still renders when route includes query parameters.

## 5. Run automated verification

```bash
npm run lint
npm test
```

## Expected Result

- Navigation component uses repo-consistent JSX authoring.
- Link destinations and active-state behavior remain correct.
- Lint and test commands pass without new navigation-related failures.

## Latest Verification Snapshot (2026-03-10)

- `npm run lint`: PASS
- `HOME=/tmp npm test`: FAIL in this execution environment while starting Vitest workers (`Starting isolated runtimes for vitest.config.ts...`), requiring follow-up in a full local runtime.
