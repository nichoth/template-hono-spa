# Contract: `/api/session` usage for nav filtering

## Response shape (JSON)

- `authenticated`: `boolean` — determines whether to hide Login/Create Account links.
- `user`: `null` or object — included when authenticated; nav filtering only depends on `authenticated` but assumes a non-null `user` when `true`.

## Invariants

- Headers must treat `authenticated === true` as a signal to drop auth links, and any other value (false, undefined, missing) should keep the full navigation.
- Clients rely on existing session restoration flow, so no additional calls to this endpoint are required for nav rendering.
