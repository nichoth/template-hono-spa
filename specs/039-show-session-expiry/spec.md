# Feature Specification: Show session expiration on profile

**Feature Branch**: `039-show-session-expiry`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "In the profile route [Image #1] Please show the session expiration like 2026-04-02, 3:21pm"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand session lifetime (Priority: P1)

When I land on the profile route I should see how long my current session lives so I can decide whether to refresh or log out before it expires.

**Why this priority**: Exposing the expiration date is the core request and ensures returning users understand how long their session remains valid.

**Independent Test**: Open `/profile` with an active session and verify that the profile summary includes a `Session Expires` label with a human-friendly timestamp similar to the requested example.

**Acceptance Scenarios**:

1. **Given** I am authenticated and the session carries an expiration timestamp, **When** the profile route renders, **Then** the panel displays `Session Expires` followed by a formatted date/time such as `2026-04-02, 3:21pm`.
2. **Given** my session is refreshed while I stay on the profile route, **When** I refresh the profile view, **Then** the `Session Expires` value updates to the new expiration timestamp without showing stale data.

---

### User Story 2 - See clear feedback when expiration data is unavailable (Priority: P2)

If the backend cannot supply an expiration timestamp, the profile route should still surface a polite message so I know the feature intentionally omitted the value.

**Why this priority**: The profile summary must remain comprehensible even when upstream data is missing, preventing blank fields that look like bugs.

**Independent Test**: Force the session payload to omit the expiration field (or simulate the absence in a test stub) and verify the UI shows the fallback copy listed below.

**Acceptance Scenarios**:

1. **Given** the session metadata lacks an expiration time, **When** the profile route renders, **Then** the card shows `Session Expires not available` instead of leaving the label empty or showing an ISO value.

---

### Edge Cases

- The expiration timestamp is already in the past (expired session) when the profile loads; the card should still display the formatted moment and may prefix it with `Expired` so I understand the session is no longer valid.
- The expiration timestamp exists but cannot be parsed; the UI should fall back to the unavailable copy above rather than showing `Invalid date`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The profile summary MUST present a `Session Expires` line that combines both the date and time in a business-friendly phrasing derived from the session metadata the backend already returns.
- **FR-002**: The expiration display MUST pair a `YYYY-MM-DD` date with a 12-hour clock time that includes the `am/pm` indicator so it matches the sample `2026-04-02, 3:21pm` provided by the stakeholder.
- **FR-003**: Whenever the session object refreshes its expiration (for example after re-authentication or background renewal), the displayed expiration line MUST update on the next profile render to avoid stale guidance.
- **FR-004**: If the expiration timestamp is missing, blank, or unparsable, the UI MUST show `Session Expires not available` so the user understands the absence of data.
- **FR-005**: The expiration line MUST use the same visual and semantic structure as the adjacent identifier and login method rows so the card remains accessible and the focus order stays unchanged.

### Key Entities *(include if feature involves data)*

- **User Session**: Represents the authenticated session metadata (identifier, expiration timestamp, login method) delivered to the profile route.
- **Profile Summary Card**: The UI surface that renders the identifier, login method, display name, and the new expiration line for the current session.

### Assumptions

- The session payload already includes an ISO-style expiration timestamp and no backend changes are required to expose this value.
- The expiration value should align with the user’s locale preferences, so the formatting sample is treated as friendly guidance rather than a strict literal string in UTC.
- The profile route refreshes on navigation or manual reload, which is sufficient for reflecting any updated expiration data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of profile views for authenticated sessions with expiration data show a `Session Expires` line next to the existing session metadata.
- **SC-002**: Quality assurance checks confirm the expiration copy includes both the date and a 12-hour time with `am/pm`, matching the style exemplified in the request.
- **SC-003**: In every scenario where the expiration timestamp is absent or invalid, the UI surface displays `Session Expires not available` so users are never confronted with blank or technical data.
- **SC-004**: After renewing the session and reloading the profile route, the expiration value shown to the user reflects the new timestamp rather than the prior value, proving the UI reads the latest metadata.
