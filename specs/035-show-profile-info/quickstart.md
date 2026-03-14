# Quickstart for Show Profile Info

1. **Prepare the workspace**
   - Ensure the dev server is running: `npm run dev` (Vite + Worker shell) or `npm run dev:worker` depending on the script.
   - The auth DB should be seeded with at least one user row that has `login_method` set to either `passkey` or `password`.

2. **Manually exercise the flow**
   - Navigate to `/login` and sign in using the desired method (passkey via the existing flow or password if available).
   - Once authenticated, visit `/profile`. Confirm the page now renders:
     - A labeled row for Identifier matching the session payload.
     - Display Name showing the stored value or `(not set)` when null.
     - Login Method showing `Passkey` or `Password` aligned with the `login_method` field.
     - Session expiration row showing the ISO timestamp or `Expires: Unknown` if the session is invalid or stale.
   - Logout via the existing control and ensure the profile card disappears, leaving the placeholder text.

3. **Automated smoke test targets**
   - Add a Vitest case (or manual qa) that mocks `/api/session` returning each of the enum values and verifies the DOM contains the right labels and fallbacks.
   - Confirm `npm test` + `npm run lint` pass after implementing the backend change.

4. **Edge checks**
   - Simulate a session response where `loginMethod` is missing by letting `users.login_method` be null, then reload `/profile` to see the fallback `Unknown method`.
   - Show that `/api/session` still responds with `{ "authenticated": false }` when no session cookie exists and that the profile route hides the card accordingly.
