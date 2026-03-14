# Research Notes for Hide Auth Links

## Decision 1: Filter nav links via `getNavRoutes(authenticated)`
**Decision:** Use the existing `getNavRoutes` helper that already omits auth links when passed `true`, rather than introducing a secondary list or manual filtering logic.
**Rationale:** `getNavRoutes` was designed to abstract the authenticated/unauthenticated menu, so reusing it keeps both desktop and mobile navs in sync with one source of truth and avoids duplicating filtering logic.
**Alternatives considered:** 1) Add conditional rendering per link inside `nav.ts`—would require managing dual lists and be error-prone. 2) Introduce a new `isAuthLink` flag consumer to hide items after rendering—more brittle and could leave placeholder gaps. Reusing `getNavRoutes(true)` ensures consistent behavior.

## Decision 2: Derive authentication state from `state.user.value.data`
**Decision:** Rely on the already computed signal that tracks session status (`state.user.value.data?.authenticated`) rather than listening for new events or storing nav-specific state, so nav updates occur automatically as the session signal changes.
**Rationale:** The feature is purely UI-state dependent, so upstream session signals are the cleanest indicator of whether login/create links should be shown; this keeps the nav stateless and fully reactive to the existing data flow.
**Alternatives considered:** 1) Track login status via a dedicated nav signal—adds extra layer requiring synchronization. 2) Poll the backend for session status before hiding links—unnecessary overhead given the already available state. The signal approach gives immediate responsiveness with no new dependencies.
