# Research Notes: Hide auth links

## Auth state source
- **Decision**: Read `state.user.value.data?.authenticated` from the shared client state to decide whether to hide the Login/Create Account entries.
- **Rationale**: The header already watches the session signal through `State.restoreSession`; using that existing signal avoids new API calls or duplicated auth logic.
- **Alternatives considered**: Polling `/api/session` separately (creates redundant network traffic) or deriving authness from another store (adds duplication).

## Filter location
- **Decision**: Apply the filter when building the `routes` list in `src/client/routes/index.ts` or directly before rendering in `nav.ts`, removing only the auth entries.
- **Rationale**: The nav renderer already consumes the same `routes` array for desktop and mobile, so filtering there automatically affects both layouts without duplicated logic.
- **Alternatives considered**: Duplicating filtering in each nav render (error-prone) or wrapping nav items in conditional components (more markup work).

## Rendering behavior
- **Decision**: Filter the nav before rendering but let the layout still render the nav wrapper so spacing stays consistent; the header should not collapse when links disappear.
- **Rationale**: Removing the list entirely might break flex alignment; keeping the nav container stable avoids layout shifts.
- **Alternatives considered**: Hiding links via CSS (less explicit) or replacing them with placeholders (adds confusion).
