# Contract: Client Routing and Server Endpoint Coexistence

## Interface

- **Name**: Client Routing Contract
- **Consumer**: Browser users and developers maintaining route behavior
- **Provider**: Client routing layer and server route handlers

## Preconditions

- Client route definitions are available in dedicated routing structure.
- App shell and client assets load successfully.
- Route definitions are maintained under `src/client/routes/`.

## Guaranteed Behavior

1. Client-managed app routes transition without full document reloads.
2. Browser history (back/forward) reflects route transitions predictably.
3. Unknown client routes resolve to explicit fallback behavior.
4. Server API/health endpoints remain available and are not consumed by client route handling.
5. Non-asset app paths return the client shell so deep links can resolve client-side.

## Verification Signals

- In-app route navigation changes visible content without full page refresh.
- Deep-link and browser-history route checks map to expected client views.
- API/health endpoints still return successful responses.

## Out of Scope

- Server-side page rendering behavior for app routes.
- Authentication or authorization policy changes.
