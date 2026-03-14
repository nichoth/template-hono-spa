# Research Log

## Decision: Use the existing logout handler on the profile page.

**Rationale**: The logout mechanism is already wired into the header/avatar area, so reusing that signal keeps the scope limited to wiring a visible button and avoids introducing new backend endpoints or session flows.

**Alternatives considered**:

- A: Introduce a dedicated `/logout` API call triggered solely from `/profile`, but that duplicates existing behavior and complicates session state.
- B: Rely on the header-only logout control and skip adding a profile-specific button, but that keeps the logout action hidden from the highest-trust page requested by the user.
