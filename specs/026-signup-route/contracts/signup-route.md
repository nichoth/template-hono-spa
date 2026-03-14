# Signup Route Contract

## UI Contract

- Top navigation includes a `Create Account` link.
- Activating that link navigates to `/signup`.
- The `/signup` route presents passkey and password method choices using the same choice pattern as the login route.
- The primary route action is labeled `Create account`.
- A successful submission does not present the visitor as signed in; it presents confirmation-pending guidance instead.

## Registration Outcome Contract

- Signup success response must support a confirmation-pending client state.
- Confirmation-pending state must include user-facing instructions that email confirmation is required.
- Signup failure response must remain actionable and route-local so the visitor can retry on `/signup`.

## Non-Goals

- This feature does not define the contents of the confirmation email itself.
- This feature does not add a separate server-rendered registration experience.
