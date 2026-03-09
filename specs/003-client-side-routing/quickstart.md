# Quickstart: Validate Client-Side Routing Integration

## 1. Install dependencies

```bash
npm install
```

## 2. Start local development server

```bash
npm start
```

## 3. Validate client-side route transitions

- Open the app and navigate through primary app links.
- Confirm route changes update visible content without full page reload.

## 4. Validate browser navigation semantics

- Use browser back/forward after several route transitions.
- Confirm content and route state remain consistent with history.

## 5. Validate deep-link and fallback behavior

- Load a known deep-link route directly (for example `/about`).
- Load an unknown client route and confirm the shell loads and the app shows fallback behavior.

## 6. Validate server endpoint coexistence

- Request API/health endpoints during app usage.
- Confirm server responses remain successful.

## 7. Run automated verification

```bash
HOME=/tmp npm test
```

## Expected Result

- Client route transitions are smooth and history-aware.
- Route definitions are centralized at `src/client/routes/index.ts` and remain maintainable.
- Server endpoints remain stable while client routing is active.
