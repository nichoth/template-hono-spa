# Data Model: Hide auth links

## Entities

### Session
- **Fields**:
  - `authenticated` (boolean): indicates whether the current session is signed in.
  - `user` (object|null): present when authenticated, contains user metadata.
- **Validation rules**:
  - Header filtering requires `authenticated === true` before hiding auth links; all other states leave the full navigation available.
  - The nav logic must react to changes in `state.user` to update the rendered routes.

### Navigation route
- **Fields**:
  - `text`: display label for the nav entry (e.g., 'Home', 'Login').
  - `href`: route path for the anchor.
  - `id` or unique identifier used to match specific entries.
- **Relationships**:
  - The nav component iterates over this collection to render both desktop and mobile menus.
- **Validation rules**:
  - Filtering must target only entries with `text` equal to 'Login' or 'Create Account'; new entries should remain untouched.
  - The filtered list must maintain the original ordering for consistency.
