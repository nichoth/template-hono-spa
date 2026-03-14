# Data Model

## Entity: SessionContext

- **Represents**: Current authentication/session state that the UI uses to decide what to render.
- **Key Fields**:
  - `isAuthenticated`: Boolean flag derived from stored tokens/signals.
  - `displayName` or `email`: Used to label the “logged in as” affordance area.
  - `logoutInProgress`: Boolean to track pending logout requests for button feedback.
  - `logoutError`: Optional error message surfaced when the logout flow fails.
- **Validation rules**: `isAuthenticated` must *only* be true when stored tokens exist; `logoutInProgress` toggles automatically when a logout request is outstanding, preventing repeated signals.
- **State transitions**:
  - `isAuthenticated:true` → logout button visible; activation sets `logoutInProgress:true`.
  - Logout success resets `isAuthenticated:false`, `logoutInProgress:false`, clears `logoutError`, and removes profile-only UI.
  - Logout failure clears `logoutInProgress` and records `logoutError` while keeping `isAuthenticated:true`.

## Entity: ProfileHeaderUI

- **Represents**: Desktop-specific header area inside `/profile` that now includes the logout control.
- **Key Fields**:
  - `logoutButtonVisible`: Mirrors `SessionContext.isAuthenticated`.
  - `message`: Shows either “logged in as …” or the error/feedback text near the button.
- **Relationships**: Reads from `SessionContext` to show/hide the button and to display feedback states.
