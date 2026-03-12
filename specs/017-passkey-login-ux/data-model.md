# Data Model: Passkey Login UX

## Entity: SignInMethod

- **Purpose**: Represents the active login path shown on the login screen.
- **Fields**:
  - `id`: stable identifier for the method, such as passkey or password
  - `label`: user-visible method name
  - `description`: supporting copy that explains when to use the method
  - `isPrimary`: whether the method is emphasized on first view
- **Validation rules**:
  - Exactly one method can be active at a time
  - The first-view experience must keep both methods discoverable

## Entity: LoginMethodState

- **Purpose**: Captures the current interactive state of the login screen as the user switches between passkey and password paths.
- **Fields**:
  - `activeMethod`: selected `SignInMethod`
  - `identifier`: current username-or-email value, when relevant
  - `password`: current password value, when relevant
  - `fieldErrors`: visible validation messages for the password path
  - `submitMessage`: visible outcome text after a password submit or passkey attempt
  - `passkeyStatus`: idle, ready, or unavailable style status for the passkey path
- **Validation rules**:
  - `password` is only required when the active method is password
  - Passkey mode must not imply password entry is required
  - Switching methods must leave the active method visually unambiguous

## Entity: PasskeyAttempt

- **Purpose**: Represents a user-initiated attempt to continue with passkey sign-in from the login screen.
- **Fields**:
  - `status`: not started, started, completed, or unavailable
  - `message`: user-visible feedback describing the current passkey outcome
  - `fallbackAvailable`: whether password sign-in remains visible after the attempt
- **Relationships**:
  - One `PasskeyAttempt` is associated with one `LoginMethodState`

## State Transitions

1. **Initial View**: Login screen loads with the recommended default method emphasis and both methods discoverable.
2. **Passkey Active**: User chooses the passkey path; passkey-specific action and supporting copy are emphasized.
3. **Password Active**: User chooses the password path; identifier and password fields become the active path.
4. **Passkey Fallback**: A passkey attempt cannot continue; the password path remains visible and available without leaving the screen.
