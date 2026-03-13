# UI Contract: Dedicated Signup Route

## Route Responsibilities

### `/login`

- Presents existing-account sign-in only.
- Exposes the shared radio-button method selector for sign-in methods.
- Shows a visible link to `/signup` near the primary sign-in action for both sign-in methods.
- Does not expose an inline create-account primary action.

### `/signup`

- Presents new-account creation only.
- Uses the same radio-button selector pattern as `/login`.
- Shows create-account messaging and a create-account primary action.
- Provides a clear route back to `/login`.

## Shared Selector Behavior

- The selector exposes exactly one active method at a time.
- Switching methods updates the visible form controls on the first interaction.
- Selection state and visible form state must remain synchronized.

## Signup Form Behavior

### Passkey method

- Displays identifier input and any account-creation fields required by the existing registration flow.
- Primary action starts account creation through the registration path, not the sign-in path.
- Success and failure messages refer to account creation, not sign-in.

### Password method

- Displays password-oriented account-creation fields only when the password option is selected.
- Does not show passkey-only explanatory copy while password is active.
- If backend support is unavailable, the UI must still keep state separation clear and avoid implying a sign-in action.
- The primary action and surrounding copy must still read as account creation, not login.

## Backend Boundary

- Signup submission uses `/api/auth/register/start` and `/api/auth/register/finish` for passkey-based account creation.
- Login submission continues to use `/api/auth/login/start` and `/api/auth/login/finish`.
- Session restoration remains handled by `/api/session`.
- Logout remains handled by `/api/logout`.

## Manual Verification Targets

- Navigating from `/login` to `/signup` works through the visible create-account link.
- Directly loading `/signup` renders the signup form without first visiting `/login`.
- The primary button label and surrounding copy reflect account creation on `/signup` and sign-in on `/login`.
