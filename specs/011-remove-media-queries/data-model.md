# Data Model: Adaptive Layout Without Media Queries

## Entity: LayoutToken
- Description: Shared presentation tokens controlling spacing, width bounds, and intrinsic layout behavior across the app shell.
- Fields:
  - `mainMaxWidth` (size): Maximum readable content width for main shell content.
  - `mainPaddingInline` (size expression): Fluid inline spacing for page gutters.
  - `gridGapFluid` (size expression): Gap value used by adaptive card grid.
  - `cardMinTrack` (size): Minimum grid track width used to derive automatic column count.
- Validation rules:
  - Token values must use fluid or relative sizing to support continuous adaptation.
  - Token values must not require breakpoint-specific overrides.

## Entity: AdaptiveGrid
- Description: Layout behavior for card list containers that self-adjust column count by available width.
- Fields:
  - `trackDefinition` (grid expression): Intrinsic track formula for automatic column derivation.
  - `rowSizing` (size rule): Minimum row sizing to prevent clipping.
  - `itemStretchMode` (enum): Rule for item fill behavior within available tracks.
- Validation rules:
  - Must support single-column rendering at narrow widths without horizontal overflow.
  - Must support multi-column rendering at larger widths without overlap.

## Entity: NavigationFlow
- Description: Navigation row behavior that keeps links and actions visible without breakpoint mode switches.
- Fields:
  - `wrapEnabled` (boolean): Whether nav rows may wrap.
  - `itemGap` (size expression): Fluid spacing between links/actions.
  - `alignmentMode` (enum): Intrinsic alignment rule preserving visibility under width changes.
- Validation rules:
  - Primary links and actions remain visible and reachable at narrow widths and 200% zoom.
  - Navigation layout must avoid clipping/overlap while resizing.

## Entity: ViewportValidationCase
- Description: Test matrix case describing a viewport/zoom condition for acceptance validation.
- Fields:
  - `widthPx` (number): Viewport width under test.
  - `zoomPercent` (number): Browser zoom level.
  - `expectedOutcome` (set): No horizontal scroll, no overlap, controls visible.
- Validation rules:
  - Required width coverage includes 320px through 1920px representative points.
  - Includes at least one 200% zoom scenario.

## Relationships
- `LayoutToken` constrains `AdaptiveGrid` and `NavigationFlow` behavior.
- `ViewportValidationCase` verifies outcomes produced by `AdaptiveGrid` and `NavigationFlow`.

## State Transitions
1. Viewport width or zoom changes.
2. Layout engine re-evaluates intrinsic grid track fit and nav wrapping.
3. Card and navigation layout settle into new arrangement without breakpoint overrides.
4. Validation confirms no horizontal overflow, no overlap, and preserved action visibility.
