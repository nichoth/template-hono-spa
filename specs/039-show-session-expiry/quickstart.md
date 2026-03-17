# Quickstart: Show session expiration on profile

1. `npm install` (if dependencies are not already available).
2. `npm run dev` to launch the Vite dev server and Cloudflare Worker shell.
3. In a browser, navigate to `/profile` while authenticated (use the existing login/passkey flows as needed).
4. Confirm the profile summary card now includes a `Session Expires` row with a user-friendly string such as `2026-04-02, 3:21pm`.
5. Trigger a session renewal (for example by re-authenticating or letting the refresh token run out and logging back in) and reload `/profile`; verify the `Session Expires` value updates to the newly issued expiration time instead of remaining static.
6. To exercise the fallback copy, open the DevTools Network panel, locate the `/api/session` request, right-click → “Edit and Resend”, remove the `session.expires` field or set it to `null`, send the request, and reload `/profile`; the card should now show `Session Expires not available` in place of a timestamp.
7. Run `npm test` to ensure the Vitest suite passes after the UI addition.

## Validation Results

- `npm run lint` ✅ (ESLint passes after updating the helper/test files)
- `npm test` ❌ (Vitest fails because `@cloudflare/vitest-pool-workers` exports `./config` which esbuild cannot resolve under the current Node.js runtime)
