# Research: Responsive Home Grid Columns

## Scope

Feature context: make the home content grid visually balanced at the screenshot width with at least 2 columns and preferably 3 when width allows, while preventing overlap and overflow during resize.

## Decision 1: Responsive column count strategy
- Decision: Use width-based breakpoints for the home content container with explicit 2-column and 3-column states.
- Rationale: Deterministic breakpoints are easy to verify against acceptance scenarios and provide predictable behavior for stakeholders.
- Alternatives considered:
  - Auto-fill with unconstrained minimum card widths: rejected because it can produce unstable column counts near thresholds.
  - Fixed 3-column desktop layout only: rejected because it fails narrow desktop/tablet transitions.

## Decision 2: Prefer 3 columns only when readability is preserved
- Decision: Promote from 2 to 3 columns only at widths where card content remains readable with no clipping or overlap.
- Rationale: Directly satisfies FR-003/FR-006 and avoids visual regressions from forcing too many columns.
- Alternatives considered:
  - Always use 3 columns above a very low threshold: rejected due to increased risk of cramped cards.
  - Keep 2 columns at all desktop widths: rejected because user requested 3 columns where feasible.

## Decision 3: Keep implementation scoped to layout styling and home route composition
- Decision: Limit changes to grid/container-related styles and home route layout wrappers.
- Rationale: Minimizes regression risk and keeps feature strictly aligned with requested UI outcome.
- Alternatives considered:
  - Refactor card component internals: rejected as out of scope.
  - Global design-system overhaul: rejected as disproportionate to requested change.

## Decision 4: Verification approach
- Decision: Use existing automated test suite (`npm test`, `npm run lint`) plus targeted manual viewport checks at reference and wide widths.
- Rationale: Existing tests protect baseline behavior; manual viewport checks validate visual layout criteria not fully covered by current specs.
- Alternatives considered:
  - Manual checks only: rejected due to weaker regression protection.
  - Add screenshot-regression infrastructure in this feature: rejected as unnecessary scope expansion.

## Decision 5: Interface contract type
- Decision: Define a UI layout contract document under `contracts/` describing observable grid behavior and acceptance scenarios.
- Rationale: This feature is UI-facing; a contract focused on visible behavior is the most appropriate external interface artifact.
- Alternatives considered:
  - API contract: rejected because no endpoint behavior changes are in scope.
  - No contract: rejected because plan phase requires explicit interface documentation where user-visible behavior exists.

## Clarification Resolution Summary

All Technical Context unknowns are resolved; no `NEEDS CLARIFICATION` items remain.

## Foundational Layout Decisions (Implementation)

- Home route uses explicit `home-layout` and `cards-grid` container classes so responsive rules remain local to the route.
- Shared layout tokens are defined in root styles for max width, grid gap, and minimum card width to keep spacing consistent across breakpoints.
- Cards use full-width grid participation with explicit overflow protection (`min-width: 0`, `overflow-wrap: anywhere`) to prevent clipping during transitions.
