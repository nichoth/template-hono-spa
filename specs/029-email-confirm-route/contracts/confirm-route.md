# Confirm Route Contract

## Path
- **Client route:** `/confirm/:code?` (code segment optional but prefers to be present). The router must treat both `/confirm` and `/confirm/abc123` as valid.

## Behavior
- On match, the SPA must stay within the shell, render the confirm view, and parse the `code` path variable.
- If `code` exists, an immediate POST to `/api/confirm` is fired with `{ identifier?, code }`.
- While the request is in-flight, the UI shows a loading indicator and disables primary actions.
- Success renders a confirmation banner with the resolved identifier (if available) and a CTA toward `/login`.
- Failure stays on the confirm route, shows a contextual error message (mapped from API `errorCode`), and exposes at least one recovery action (`Retry` or `Request new code`).
- Visiting `/confirm` without a code renders guidance copy and a helper CTA to send a new confirmation email or return to login; no API call is made.
- All states must be keyboard accessible, and any dynamic messages should be announced via `aria-live`.
