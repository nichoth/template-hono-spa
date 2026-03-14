# Header login state design

## Overview
- Purpose: surface login state in the desktop hero header so users immediately know whether they're authenticated and which account is active.
- Scope: only the desktop layout next to the avatar; mobile keeps the existing header to avoid cramped space.

## Layout & Styling
- Insert a text block between the desktop nav and avatar that reads `logged in as <email>` when authenticated or `anonymous` otherwise.
- Keep font weight/light styling consistent with nav links and never reduce the font size below `1rem` so the text remains readable.
- Use the existing color palette for link text to keep the status subtle but aligned with the header visuals.

## Data & Interaction
- Source the user identifier from `State.user` after the `/api/session` response; if the request succeeds, show `logged in as` plus the `identifier` (email). If the request is pending or fails, fallback to `anonymous`.
- The text is static; clicking the avatar still navigates to `/profile` and the login-state text should not interfere with that anchor.

## Testing & Validation
- Verify the desktop hero header shows `logged in as user@example.com` when the session response includes user data.
- Confirm it displays `logged in as anonymous` when the session promise resolves with `authenticated:false` or on error.
- Ensure on mobile viewports the new text is hidden so the header layout matches the prior mobile experience.
