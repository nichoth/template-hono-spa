# Research Notes: Show login state

## Login state source
- **Decision**: Use the existing `state.user` signal populated by `State.restoreSession` to read `data?.authenticated` and `data?.user.identifier`.
- **Rationale**: The header already renders after hydration of the SPA; reading from this signal avoids introducing extra API calls and reuses the same request that powers the login/account flows.
- **Alternatives considered**: Polling `/api/session` from the header (causes duplicate network traffic), storing email in a separate global store (adds duplication and sync concerns).

## Desktop-only indicator layout
- **Decision**: Insert a simple text node between the nav component and avatar anchor and hide it via CSS below ~680px, ensuring the mobile layout stays unchanged.
- **Rationale**: The requirement explicitly called for desktop-only text; controlling visibility with a media query is the simplest approach while keeping the DOM structure static.
- **Alternatives considered**: Wrap the avatar and text in a new component triggered only on desktop (adds complexity) or show the text inside a tooltip/hint (contradicts "should add text" requirement).

## Styling constraints
- **Decision**: Style the login status text to match the nav link color, enforce `font-size: 1rem`, and provide spacing so it does not collide with the avatar. Desktop-only visibility is controlled via a media query.
- **Rationale**: The user insisted on no font sizes below 1rem, and matching nav link styling keeps the text a subtle header label rather than a flashy badge.
- **Alternatives considered**: Use a badge or pill (would require additional visual treatment) or reuse the `nav-link` class (would confuse semantics since the text is not a link).

## Signal computation best practice
- **Decision**: Wrap the derived login label inside a `useComputed` hook so the header rerenders only when `state.user` changes, keeping the logic isolated from markup.
- **Rationale**: `@preact/signals` encourages computed values instead of recomputing inline, and the existing code already uses `useComputed` for route matching.
- **Alternatives considered**: Inline `state.user.value.data` access inside the template (acceptable but less explicit) or create a new signal derived via `signal()` and `effect()` (more boilerplate).
