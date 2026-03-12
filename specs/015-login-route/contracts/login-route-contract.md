# Login Route UI Contract

## Overview

This feature adds a public client-side route at `/login` that provides a UI-only login form. The route does not authenticate users, create sessions, or redirect into protected content.

## Route Contract

- **Path**: `/login`
- **Access**: Public, same as other client-managed app routes
- **Rendering mode**: App shell response from the server, followed by client-side route rendering

## Page Content Contract

When the `/login` route renders, the page must provide:

1. A recognizable login heading
2. One identifier input for username or email entry
3. One password input
4. One submit control
5. Space for validation and post-submit status feedback

## Interaction Contract

1. **Given** the visitor opens `/login`, **Then** the route renders the login page instead of a missing-route state.
2. **Given** the visitor submits without all required fields, **Then** the route remains on `/login` and presents clear corrective feedback.
3. **Given** the visitor submits with both required fields completed, **Then** the route remains on `/login` and presents a visible informational message that login processing is not connected.
4. **Given** the visitor corrects one field after a failed submit, **Then** the route preserves the other field values unless the visitor changes them.

## Non-Goals

- No network login request
- No session creation
- No redirect to another route on submit
- No change to API endpoints, worker auth behavior, or protected-route policy
