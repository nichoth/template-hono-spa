# Research: Adaptive Layout Without Media Queries

## Scope

Feature context: remove media-query-dependent layout behavior and use intrinsic CSS Grid and fluid units so layout adapts continuously across small and large viewports.

## Breakpoint Removal Scope And Target Files

- Remove media-query layout branching from:
  - `/Users/nick/code/template-hono-spa/src/client/routes/home.css`
  - `/Users/nick/code/template-hono-spa/src/client/components/nav.css`
- Normalize shared adaptive layout tokens in:
  - `/Users/nick/code/template-hono-spa/src/style.css`
- Apply long-content stability safeguards in:
  - `/Users/nick/code/template-hono-spa/src/client/components/card.css`

## Research Dispatch Summary

- Task: Research intrinsic grid patterns for variable-width card layouts in app shells.
- Task: Research best practices for fluid spacing and sizing units that avoid breakpoint overrides.
- Task: Research resilient navigation wrapping patterns without media queries.
- Task: Research verification patterns for confirming absence of media queries and preventing regressions.

## Decision 1: Use intrinsic grid columns with `repeat(auto-fit, minmax())`
- Decision: Use an intrinsic column definition for card grids so column count changes as available width changes, without viewport breakpoints.
- Rationale: `auto-fit` + `minmax()` allows smooth one-column to multi-column transitions based on actual container width rather than hard-coded breakpoint thresholds.
- Alternatives considered:
  - Keep explicit 1/2/3-column media-query steps: rejected because the feature explicitly disallows media queries.
  - Use flexbox-only multi-row cards: rejected because predictable equal column behavior is weaker for this card grid use case.

## Decision 2: Use fluid units and clamps for spacing and content bounds
- Decision: Use relative and fluid units (`rem`, `%`, `vw`, `clamp()`) for gaps, padding, and readable width constraints.
- Rationale: Fluid units preserve readability from narrow to wide viewports and reduce abrupt spacing shifts.
- Alternatives considered:
  - Fixed pixel spacing system: rejected because it scales poorly across 320px-1920px.
  - Media-query-based spacing tiers: rejected because breakpoint rules are out of scope.

## Decision 3: Keep navigation adaptive through wrapping and intrinsic distribution
- Decision: Keep nav container and link list responsive by wrapping and intrinsic sizing, avoiding directional layout flips at breakpoints.
- Rationale: Continuous wrapping behavior keeps links visible and operable under narrow widths and zoom without extra breakpoint logic.
- Alternatives considered:
  - Switch nav mode at breakpoints: rejected due to no-media-query constraint.
  - Hide low-priority nav links: rejected because feature requires preserving primary actions visibility.

## Decision 4: Define a no-media-query compliance and viewport validation routine
- Decision: Add explicit verification steps: static check for `@media` in target CSS and manual viewport matrix checks (320px, 480px, 768px, 1024px, 1440px, 1920px plus 200% zoom).
- Rationale: The feature has a hard constraint (no media queries) and UX outcomes that require visual behavior checks.
- Alternatives considered:
  - Rely on test suite only: rejected because current automated tests do not fully validate visual layout quality.
  - Informal spot-checks with no documented matrix: rejected because repeatability would be weak.

## Clarification Resolution Summary

All technical-context unknowns are resolved. No `NEEDS CLARIFICATION` markers remain.
