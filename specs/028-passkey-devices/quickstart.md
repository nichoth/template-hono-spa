# Quickstart: Verifying passkey persistence and flows

1. **Start the local worker**: `npm run dev` to host the Hono server and D1 binding. Keep an eye on the DEV logs for D1 readiness.
2. **Register a passkey device**: POST the WebAuthn enrollment payload to `/api/auth/passkey/register` (existing auth route). After the request, query D1 using `wrangler d1 execute --name <D1_NAME> --sql "SELECT * FROM users"` to confirm the new user row and `SELECT * FROM devices` to confirm the credential metadata.
3. **Authenticate with a credential**: POST the login assertion payload to `/api/auth/passkey/login`. The response should return the user record linked to the device and D1 should show the `counter` incremented and `last_used_at` updated.
4. **Revoke a device**: Call the DELETE or PATCH route that marks `is_revoked` on `devices`. Triggering another login with that credential should fail before signature verification, and the row remains for audit purposes.
5. **Audit devices for a user**: Query `/api/auth/passkey/devices?userId=<UUID>` (or run a direct D1 query) to assert the endpoint returns devices sorted by `last_used_at`, including revoked flags.

Follow these steps to confirm registration, login, revocation, and device listing behaviors tie back to the `users` and `devices` tables.
