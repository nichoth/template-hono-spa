## Research Notes

### Decision 1: Route `/confirm/:code` is served by the existing SPA shell
**Decision:** Treat `/confirm/<code>` and `/confirm` as known client routes so the SPA never returns 404 and the confirm view is rendered inside the current shell.  
**Rationale:** The existing router already handles `/login`, `/signup`, etc., so adding `/confirm/:code` as another route keeps routing consistent and avoids server changes.  
**Alternatives considered:** Redirecting to `/login` with query parameters would have required reusing the login view and lost the dedicated confirmation UX; serving a standalone static page would duplicate shell layout and complicate client-server parity.

### Decision 2: Confirm view posts `{ identifier?, code }` to `POST /api/confirm`
**Decision:** Once the confirm route loads with a code segment, the client POSTs the code (and optionally the identifier) to `/api/confirm` to activate the account.  
**Rationale:** The backend already exposes an authentication pipeline; reusing a single confirm endpoint centralizes validation and server-side error handling while keeping the client stateless.  
**Alternatives considered:** Submitting the code to the login API would blur responsibilities and require the login view to pretend to be a confirmation route; a dedicated `GET /confirm` server endpoint would need new routing on the Worker and duplicate the SPA shell.

### Decision 3: Codes are only logged to console in dev/localhost
**Decision:** Confirmation codes stay confidential except for console logs when `import.meta.env.DEV` (or similar) is true; production builds never log them.  
**Rationale:** The spec explicitly forbids other transport methods in production, but console logs help local development. Feature implementation will respect the existing `import.meta.env` guard already used elsewhere.  
**Alternatives considered:** Storing codes in localStorage for debugging would risk leaking tokens; emailing them to developers would violate the “code only via email” requirement.
