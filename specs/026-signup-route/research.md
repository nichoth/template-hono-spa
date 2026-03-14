# Research: Signup Navigation And Confirmation

## Decision 1: Add the top-level signup link through the centralized route metadata

- Decision: Extend the shared `routes` metadata so both desktop and mobile navigation automatically pick up a `Create Account` link.
- Rationale: The nav component already renders links from the central route list. Adding the signup entry there keeps desktop and mobile nav in sync and avoids hard-coding a second navigation path.
- Alternatives considered:
  - Add a standalone `Create Account` anchor directly in `nav.ts`: rejected because it would diverge from the current centralized nav pattern.
  - Keep signup reachable only from the login screen: rejected because the requirement explicitly calls for a top-nav link.

## Decision 2: Reuse the login route’s method-selection UX on `/signup`

- Decision: Keep the signup form aligned with the login screen by using the same passkey-versus-password radio selector structure and route-level copy pattern.
- Rationale: The current login route already establishes the expected auth UI pattern. Reusing that structure lowers cognitive load and keeps public auth screens visually consistent.
- Alternatives considered:
  - Build a signup-only method switcher with different labels/layout: rejected because it adds unnecessary divergence from the referenced login experience.
  - Remove the method switcher and force one signup path: rejected because the requirement explicitly calls for the same passkey/password radio buttons.

## Decision 3: Change successful signup from immediate authenticated session to confirmation-pending messaging

- Decision: Treat successful signup as the start of an email-confirmation flow and return a confirmation-pending outcome that the client can render on `/signup`.
- Rationale: The existing passkey registration flow immediately creates a session, but the new requirement changes the business outcome: after clicking `Create account`, the backend sends an email and the UI must instruct the user to confirm their address. That requires a contract change across the registration flow.
- Alternatives considered:
  - Keep immediate login and show an extra email note: rejected because it conflicts with the requirement not to imply account completion before email confirmation.
  - Show only a generic success toast with no next-step guidance: rejected because the user needs explicit confirmation instructions.
