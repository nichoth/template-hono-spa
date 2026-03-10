# Data Model: Responsive Home Grid Columns

## Entity: GridLayoutProfile
- Description: Defines how the home content area is arranged at a viewport range.
- Fields:
  - `name` (string): Human-readable label for the profile (for example, "two-column", "three-column").
  - `minViewportWidth` (number): Inclusive lower viewport bound for profile activation.
  - `maxViewportWidth` (number | null): Exclusive upper viewport bound; null for open-ended upper range.
  - `columnCount` (integer): Number of visible grid columns in this profile.
  - `gapSize` (string): Visual spacing token/value between items.
- Validation rules:
  - `columnCount` must be >= 1.
  - Profile ranges must not overlap.
  - At the reference viewport range, `columnCount` must be >= 2.
  - At wide desktop profile, `columnCount` must be 3 when readability constraints are met.

## Entity: GridItem
- Description: A visual card/item rendered within the home content grid.
- Fields:
  - `id` (string): Stable identifier for item placement.
  - `contentLength` (integer): Relative content size for layout stress cases.
  - `minReadableWidth` (number): Minimum width needed before content becomes cramped.
- Validation rules:
  - Item must remain fully visible at all supported column profiles.
  - Item content must wrap or flow without clipping.

## Entity: LayoutTransition
- Description: Runtime transition when viewport crosses a column threshold.
- Fields:
  - `fromProfile` (string): Previous `GridLayoutProfile.name`.
  - `toProfile` (string): New `GridLayoutProfile.name`.
  - `horizontalOverflow` (boolean): Whether overflow appears during transition.
  - `overlapDetected` (boolean): Whether items overlap during transition.
- Validation rules:
  - `horizontalOverflow` must always be false.
  - `overlapDetected` must always be false.

## Relationships
- `GridLayoutProfile` controls arrangement rules applied to all `GridItem` entries.
- `LayoutTransition` references two `GridLayoutProfile` states and validates responsive behavior quality.

## State Transitions
1. Initial load applies the active `GridLayoutProfile` for the current viewport.
2. Browser resize can trigger `LayoutTransition` from 3-column to 2-column, or 2-column to 3-column.
3. Transition is valid only when no overlap, clipping, or horizontal scrolling appears.
