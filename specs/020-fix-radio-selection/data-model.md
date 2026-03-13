# Data Model: Fix Radio Selection

## Entity: SignInMethodOption

- **Purpose**: Represents one selectable login method in the shared radio-input control.
- **Fields**:
  - `id`: stable method identifier, such as passkey or password
  - `label`: visible label shown next to the radio control
  - `selected`: whether the option is currently active
  - `visibleIndicator`: whether the selected state is visibly reflected in the control on screen
- **Validation rules**:
  - Exactly one option can be selected at a time
  - The visible indicator must match the current selected option immediately after a click

## Entity: LoginMethodSelectionState

- **Purpose**: Captures the current selected method and the login content that should appear for that method.
- **Fields**:
  - `activeOption`: selected `SignInMethodOption`
  - `identifier`: username-or-email value for the password path
  - `password`: password value for the password path
  - `fieldErrors`: current password-path validation messages
  - `submitMessage`: user-visible feedback after password submit or passkey attempt
  - `passkeyStatus`: whether passkey is idle or already attempted
- **Validation rules**:
  - The selected method and visible content must update together after one click
  - Password fields are only active when password is selected
  - Passkey guidance and action are only active when passkey is selected

## Entity: SelectedStateFeedback

- **Purpose**: Represents the visible confirmation that the correct radio option is selected.
- **Fields**:
  - `selectedOptionId`: which option is visually selected
  - `selectionTiming`: whether the visual selection updates immediately after interaction
  - `contentSync`: whether the visible method-specific content matches the selected option
- **Validation rules**:
  - `selectedOptionId` must match `activeOption`
  - `selectionTiming` must be immediate on the first click
  - `contentSync` must remain correct even after validation or status messages

## State Transitions

1. **Initial View**: The login screen loads with one option selected by default and matching content visible.
2. **Password Selection**: The user clicks password once; the password option becomes visibly selected and password fields become the active controls immediately.
3. **Passkey Selection**: The user clicks passkey once; the passkey option becomes visibly selected and passkey guidance plus action become active immediately.
4. **Post-Feedback Sync**: Validation errors or passkey status feedback appear, but the selected option and visible content remain synchronized.
