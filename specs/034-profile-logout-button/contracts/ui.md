# UI Contract: Profile Logout Button

## Intent
Ensure the profile header exposes a logout control that matches the visual language of the avatar/text area and provides clear success/error feedback for desktop audiences.

## Consumers
- `/profile` page renderer.
- Auth/session UI component (`login-status.ts`) that already manages the logout action.

## Expectations
- Control is rendered only when `SessionContext.isAuthenticated` is true.
- Button label reads “Logout” (or equivalent) and sits near the avatar, following existing spacing and typography.
- Clicking the button triggers the shared logout handler and exposes a pending indicator until the response completes.
- Any errors display inline, and the button re-enables so the user can retry without leaving `/profile`.
