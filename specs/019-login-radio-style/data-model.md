# Data Model: Login Radio Style

## Entity: SignInMethodOption

- **Purpose**: Represents one visible option in the shared radio-style selector on the login route.
- **Fields**:
  - `id`: stable method identifier, such as passkey or password
  - `label`: visible selector label
  - `selected`: whether the option is the active method
  - `presentationRole`: whether the option is styled as active or inactive in the shared selector pattern
- **Validation rules**:
  - Exactly one option can be selected at a time
  - Both options remain visible within the same selector group
  - The selected option must be visually distinguishable from the inactive option

## Entity: LoginMethodSelectionState

- **Purpose**: Captures the currently selected sign-in method and the login content shown for that method.
- **Fields**:
  - `activeOption`: selected `SignInMethodOption`
  - `identifier`: current username-or-email value when password is active
  - `password`: current password value when password is active
  - `fieldErrors`: visible validation feedback for the password path
  - `submitMessage`: current message shown after passkey or password actions
  - `passkeyStatus`: whether the passkey path is idle or has been attempted
- **Validation rules**:
  - Password fields are only required when password is the active option
  - Passkey can remain active without making password fields required
  - Switching options updates the active content without leaving the route

## Entity: SharedSelectorPresentation

- **Purpose**: Represents the observable presentation rules that align the login selector with the referenced create-account pattern.
- **Fields**:
  - `groupLayout`: arrangement of both method options in one row or grouped cluster
  - `optionSpacing`: spacing between options and between the selector and method-specific content
  - `selectedStateCue`: visible emphasis indicating the active option
  - `contextPosition`: placement of the selector relative to the surrounding login content
- **Validation rules**:
  - The selector must remain visible while the active method content changes
  - The selector must remain coherent when text wraps or the layout narrows
  - The overall presentation must remain recognizably in the same control family as the shared reference

## State Transitions

1. **Initial View**: The login screen loads with both radio options visible and one option selected by default.
2. **Passkey Active**: The passkey option is selected, and passkey guidance plus the passkey action are shown as the active path.
3. **Password Active**: The password option is selected, and identifier plus password fields become the active controls.
4. **Fallback Available**: A passkey attempt cannot continue, and the password option remains visible within the same selector for recovery.
