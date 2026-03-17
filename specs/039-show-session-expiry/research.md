# Research: Show session expiration on profile

## Expiration formatting

- **Decision**: Render the existing session expiration timestamp as a human-friendly string that matches the stakeholder’s example (`2026-04-02, 3:21pm`), combining `YYYY-MM-DD` with a 12-hour clock time and `am/pm`.
- **Rationale**: The request explicitly referenced that sample style, so mirroring that pattern keeps the product team and users aligned; most browsers already expose locale-aware formatting helpers, so we can derive the string client-side without asking for backend changes.
- **Alternatives considered**:
  - Leave the current ISO string in place → rejected because it is harder for users to read quickly.
  - Hide the expiration information entirely until a tooltip is shown → rejected because the stakeholder explicitly asked to surface the expiration time directly.

## Absent or unparsable expiration values

- **Decision**: When the session payload omits or cannot parse the expiration field, show the text `Session Expires not available` while keeping the label visible so users understand the absence of data.
- **Rationale**: This keeps the card layout stable and avoids confusing blanks or technical output; it also signals that the feature intentionally skipped the data rather than waiting for an error.
- **Alternatives considered**:
  - Hide the `Session Expires` row when the timestamp is missing → rejected because a disappearing row looks like a broken layout and fails the requirement to show the fallback state.
  - Show the raw or partial value (e.g., `Invalid date`) → rejected because it surfaces technical jargon instead of user-friendly guidance.
