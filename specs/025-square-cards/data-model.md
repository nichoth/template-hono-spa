# Data Model: Square Home Cards

## Home Card Layout Contract

### Entity: HomeCard

- Fields:
  - `variant`: `counter | text | fetcher`
  - `preferredAspectRatio`: constant `1 / 1` for home-route presentation
  - `canGrowVertically`: boolean, always `true`
  - `contentBlocks`: heading, body copy, controls, or response output
- Validation rules:
  - Must remain readable when rendered at the preferred square size
  - Must be allowed to exceed square height if child content requires more space

### Entity: HomeCardRow

- Fields:
  - `columnCount`: `3`
  - `overflowBehavior`: `horizontal-scroll-when-needed`
  - `gap`: sourced from `--layout-grid-gap`
- Validation rules:
  - Must prefer a single visible row of three cards on the home route
  - Must preserve left-to-right card order when overflow is active

### Entity: HomeCardViewportState

- Fields:
  - `availableInlineSize`: viewport-constrained width for the home route container
  - `needsOverflowScroll`: derived boolean
  - `resolvedCardInlineSize`: width chosen from grid track sizing
- State transitions:
  - `fits-three-columns` -> `overflow-scroll` when viewport width is less than the minimum width needed for three square columns plus gaps
  - `overflow-scroll` -> `fits-three-columns` when viewport width becomes large enough again
