# Data Model: Radio Passkey Control

## Entity: SignInMethodOption

- **Purpose**: Represents one selectable login method within the radio-button control group.
- **Fields**:
  - `id`: stable identifier for the option, such as passkey or password
  - `label`: user-visible option label
  - `selected`: whether the radio option is currently active
  - `description`: supporting guidance associated with the selected method
- **Validation rules**:
  - Exactly one option can be selected at a time
  - Both passkey and password options must remain visible in the same control group

## Entity: LoginMethodSelectionState

- **Purpose**: Captures the current selected radio option and the resulting login controls shown on the screen.
- **Fields**:
  - `activeOption`: selected `SignInMethodOption`
  - `identifier`: current username-or-email value, when relevant
  - `password`: current password value, when relevant
  - `fieldErrors`: visible validation messages for the password path
  - `submitMessage`: visible outcome text after a password submit or passkey attempt
  - `passkeyStatus`: idle, ready, or unavailable state for the passkey path
- **Validation rules**:
  - `password` is only required when the password option is selected
  - Passkey selection must not imply that password fields are required
  - Changing radio selection must update the active login controls without leaving the route

## Entity: PasskeyAttempt

- **Purpose**: Represents a user-initiated attempt to continue with passkey sign-in after the passkey radio option is selected.
- **Fields**:
  - `status`: not started, started, completed, or unavailable
  - `message`: user-visible feedback describing the current passkey outcome
  - `fallbackAvailable`: whether the password option remains visible after the attempt
- **Relationships**:
  - One `PasskeyAttempt` is associated with one `LoginMethodSelectionState`

## State Transitions

1. **Initial Selector View**: Login screen loads with both radio options visible and one option selected by default.
2. **Passkey Selected**: User selects the passkey radio option; passkey-specific action and copy become the active path.
3. **Password Selected**: User selects the password radio option; identifier and password fields become the active controls.
4. **Passkey Fallback**: A passkey attempt cannot continue; the password option remains selectable in the same radio group.
