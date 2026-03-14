# Data Model: Signup Navigation And Confirmation

## Entity: SignupNavigationLink

- Fields:
  - `href`: fixed route `/signup`
  - `text`: fixed label `Create Account`
  - `visibility`: shown in shared public navigation
- Validation rules:
  - Must appear in the same nav system as existing public links
  - Must route to the client-side signup screen

## Entity: SignupMethodSelection

- Fields:
  - `method`: `passkey | password`
  - `defaultMethod`: the initially selected signup method
  - `availableActions`: form submission actions associated with the selected method
- Validation rules:
  - Must use the same passkey/password choice model as the login screen
  - Must update the signup form presentation to match the selected method

## Entity: SignupSubmission

- Fields:
  - `identifier`: user email address or account identifier
  - `displayName`: optional display name
  - `password`: password value when password signup is selected
  - `method`: selected signup method
- Validation rules:
  - Must include the fields required for the selected signup method
  - Must preserve unchanged valid fields when feedback requests a correction

## Entity: ConfirmationPendingResult

- Fields:
  - `status`: confirmation-pending state
  - `identifier`: account identifier tied to the confirmation email
  - `message`: user-facing instruction to check email and confirm the address
- State transitions:
  - `idle` -> `submitting` when the visitor activates `Create account`
  - `submitting` -> `confirmation_pending` when the backend successfully starts email confirmation
  - `submitting` -> `error` when the backend cannot start the signup flow
