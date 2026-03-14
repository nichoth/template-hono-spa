# Email Confirmation Route Data Model

## ConfirmationCode
- **Purpose:** Represents the token delivered via email that proves the user controls the identifier.
- **Fields:**
  - `code` (string, { length: 32? }): The opaque token; must match the server-generated value.
  - `identifier` (string): The associated email/username.
  - `expiresAt` (ISO 8601 timestamp): When the code becomes invalid.
  - `status` (enum: `pending`, `used`, `expired`): Determines whether the code can be re-used.
- **Validation:** Server rejects codes older than `expiresAt`, status must be `pending`, and the submitted `code` must match the stored hash.
- **State transitions:** `pending` → `used` when `/api/confirm` accepts the token; `pending` → `expired` when TTL lapses or code is reissued.

## EmailConfirmationIntent
- **Purpose:** Tracks the client-side intent to confirm an account from a route link.
- **Fields:**
  - `code` (string | null): Extracted from the path segment; null if missing.
  - `identifier` (string | null): Derived from the query, stored state, or API response to personalize copy.
  - `status` (enum: `idle`, `submitting`, `success`, `error`): Controls UI state transitions and banner text.
  - `message` (string | null): The human-facing success or error message.
  - `errorCode` (string | null): API-specific error such as `invalid_code` used for conditional UI logic.
  - `actions` (flags): e.g., `canResendCode`, `canRetrySubmission`.
- **Validation:** The client only submits when `code` contains a non-empty value; `identifier` is optional but enhances UX.
- **State transitions:** When the route loads with `code`, `status` moves from `idle` → `submitting`; success sets `status` → `success`, error sets `error` and exposes `canRetryCode`.

## ConfirmRouteContext
- **Purpose:** Captures per-route rendering details used by the Preact view.
- **Fields:**
  - `routeMatched` (boolean): Indicates that `/confirm` or `/confirm/:code` is active.
  - `isValidCode` (boolean): Derived from parsing and preliminary validation (e.g., non-empty string).
  - `bannerVisible` (boolean): Controls whether the success banner or error panel appears.
  - `ctaTarget` (string): Typically `/login` or `/signup` depending on state flows.
- **Relationships:** Builds on `EmailConfirmationIntent` by reflecting `status` into UI toggles; no server persistence.
