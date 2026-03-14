# Feature Specification: Email Confirmation Route

**Feature Branch**: `029-email-confirm-route`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "We need to handle the email confirmation route in client-side routing [Image #1]."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirm via emailed code (Priority: P1)

After a new account is created, the user receives an email link containing `https://app/confirm/<code>`. Clicking the link opens the SPA, routes to `/confirm/<code>`, and immediately submits the code (plus the email/identifier) to `POST /api/confirm` so the user sees a success message and can proceed to login without manually re-entering the code.

**Why this priority**: The confirmation code is the control point for account activation, so the user journey must never land on 404s or require manual copying of the code.

**Independent Test**: Start the SPA with a known test code, visit `/confirm/abc123`, intercept the outgoing POST `/api/confirm`, respond with success, and verify the UI renders the success banner and offers the “Go to Login” option.

**Acceptance Scenarios**:

1. **Given** `/confirm/<code>` is requested with a code generated earlier, **When** the SPA routes to it, **Then** the confirm view shows a loading state, POSTs `{ identifier, code }` to `/api/confirm`, and switches to a success confirmation state when the request returns 200.
2. **Given** the API responds with success, **When** the user views the page, **Then** a success banner is visible, placeholder text advises checking the inbox for next steps, and a CTA navigates them to `/login`.

---

### User Story 2 - Invalid or expired code (Priority: P2)

If the confirmation code is expired, already used, or otherwise invalid, the `/confirm/<code>` view should show a clear error, allow re-requesting a new code, and not leave the user stuck on a blank page.

**Why this priority**: Code validation failures can be caused by expired links or replay attacks; the UI must give users a trustworthy recovery path.

**Independent Test**: Visit `/confirm/expired` while the API returns a 400/409 error, and verify the UI remains on the confirm route with the error message, “Request new code” control, and no crashing or fallback to 404.

**Acceptance Scenarios**:

1. **Given** the API returns `invalid_code` or `expired_code`, **When** the POST completes, **Then** the error message is rendered with guidance to request a new code, while keeping the user on `/confirm/<code>`.
2. **Given** the user clicks the “Request new code” action, **When** the related form or button is used, **Then** the client triggers whatever existing flow resurfaces (e.g., resend email) and shows status feedback.

---

### User Story 3 - Navigating without a code (Priority: P3)

Users who land on `/confirm` or `/confirm/` manually in the browser (e.g., bookmarking the route) should be greeted with an explanation that they need a confirmation link, not the raw route, including a link to request a new confirmation email or return to login.

**Why this priority**: The route must stay available for deep links while gracefully handling missing parameters.

**Independent Test**: Visit `/confirm` or `/confirm/` without a code; confirm that the confirm view displays guidance copy, no API call is made, and navigation targets are rendered to proceed elsewhere.

**Acceptance Scenarios**:

1. **Given** the path lacks a code segment, **When** the route renders, **Then** no `/api/confirm` call is invoked, the user sees contextual help, and the CTA surfaces the `/login` page.

---

### Edge Cases

- The confirmation code lands when the user is already signed in; the view should still show the confirmation message and avoid conflicting session UI.
- Querying `/confirm/<code>` with double-encoded or URL-unsafe characters still routes to the confirm view, decodes safely, and either submits or gracefully fails.
- Emails might intentionally send the code without exposing the identifier in the link; the route should allow re-entry or retrieval of the identifier if necessary while keeping the code front-and-center.
- If the confirmation API is unreachable, the confirm view should show a persistent retry/refresh suggestion instead of a generic network failure page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Clients MUST recognize `/confirm/<code>` (including `/confirm/` with missing code) as a valid client route that never yields a 404, and it should reuse the existing SPA shell.
- **FR-002**: When a code is present, the client MUST immediately POST `{ identifier, code }` (identifier inferred from query, form, or state) to `/api/confirm` and show a loading state until a response arrives.
- **FR-003**: The confirm view MUST show a success banner with confirmation copy, including the user’s identifier (when available) and a CTA to proceed to `/login` once the API responds positively.
- **FR-004**: When the API signals `invalid_code`, `expired_code`, or similar, the view MUST stay on `/confirm/<code>`, display the tailored error, and expose a way to request a fresh code or contact support.
- **FR-005**: The confirm route MUST never reveal the code through logs or non-email channels in production; logging to the console is allowed only in localhost/dev environments.
- **FR-006**: When the user ignores the code and lands on `/confirm` without parameters, the view MUST explain that a confirmation link is required, offering at least a login link or code resend hint.
- **FR-007**: All error and success states on `/confirm/<code>` MUST be accessible, keyboard-navigable, and announced to screen readers (focus management and aria-live are part of the implementation plan).

### Key Entities *(include if feature involves data)*

- **ConfirmationCode**: Represents the per-email token delivered by the backend. Core attributes are the hashed token, expiration timestamp, associated `identifier`, and `status` (pending, used, expired). It is validated via `/api/confirm`.
- **EmailConfirmationIntent**: Mirrors the front-end intent to activate an account, holding the `code`, optionally captured `identifier`, current UI `state` (loading, success, error), and available actions (`retry`, `resend`).
- **ConfirmRouteContext**: Front-end routing context that records whether the path included a code, whether the code has been submitted, and what message (success/error) is shown to the user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of `/confirm/<code>` smoke tests in staging reach the client success state (login CTA visible) within 3 seconds when the server responds with success.
- **SC-002**: Invalid or expired codes render the error state 100% of the time, and the “Request new code” control appears in 95%+ of those tests.
- **SC-003**: Manual visits to `/confirm` (no code) are handled on every test run without API calls, preserving the SPA shell and showing guidance content instantly.
- **SC-004**: Production logging does not expose confirmation codes; validated by a code review or automated log scan verifying console output does not include the code outside `import.meta.env.DEV`.

## Assumptions

- The backend already exposes `POST /api/confirm` and will validate the code, returning structured errors like `invalid_code` or `expired_code`.
- The email link is the only production channel for delivering codes; console logging of codes is acceptable only when `import.meta.env.DEV` or equivalent is truthy.
- The confirm route is rendered client-side; no additional server redirects or tokens beyond the code and optional identifier are required.
