# `/api/session` Response Contract

## Endpoint Overview
- **Method:** GET `/api/session`
- **Purpose:** Returns the authenticated session snapshot consumed by the SPA. It must continue to signal `authenticated` status and include the user’s identifier/display name while adding the `loginMethod` flag.

## Response Shape (200 OK)
```json
{
  "authenticated": true,
  "user": {
    "id": "string",
    "identifier": "string",
    "displayName": "string | null",
    "login_method": "passkey" | "password"
  },
  "session": {
    "expiresAt": "ISO 8601 string"
  },
  "loginMethod": "passkey" | "password"
}
```

## Field Guarantees
- `authenticated` is `true` when the cookie/session token is valid; otherwise the API returns `{ "authenticated": false }`.
- When `authenticated` is `true`, `user` and `session` objects must both exist.
- `loginMethod` duplicates `user.login_method` so clients can read it without digging through nested objects; it must always match the enum value stored in the database.
- `session.expiresAt` must be an ISO 8601 string produced by `new Date(expires_at).toISOString()` from the D1 `sessions.expires_at` column.

## Contract Rules
- Clients rely on this response to render `/profile`, so no additional wrapping or pagination is allowed.
- Introduce no new required fields beyond what is documented here; optional metadata may be added later under new keys as long as existing consumers ignore unknown fields.
