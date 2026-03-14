# Research Notes for Show Profile Info

## Decision 1: Source the login method from the user record and spill it through `/api/session`
**Decision:** Extend the authenticated session response so the `user` object includes a `loginMethod` field (passkey or password) derived directly from the `users.login_method` column in D1.
**Rationale:** The session signal already powers the profile page, so adding the flag there avoids extra API calls or new persistence layers. It keeps the UI in sync with the single source of truth controlled by the backend.
**Alternatives considered:** 1) Query a separate `/api/profile` endpoint—discarded because it would duplicate state and require another fetch. 2) Examine auth event audit trails—discarded because the profile view needs deterministic, current data rather than historical traces.

## Decision 2: Surface the new field via the existing `State.user` contract and render a labeled profile card with fallbacks
**Decision:** Update the TypeScript `SessionResponse` shape and `State.restoreSession` so `loginMethod` travels with the rest of the payload, and the profile UI renders every attribute with fallback text for missing values.
**Rationale:** This keeps the entire feature in observed state rather than ephemeral UI variables, so the page automatically reflects whatever the latest session contains. Fallbacks ensure accounts created before the flag was added remain readable.
**Alternatives considered:** 1) Keep the login method private and only show identifier/display name—rejected because the user explicitly asked to show the login method. 2) Only show login method when it exists—decided to still render a descriptive “Unknown method” state to avoid blank rows.
