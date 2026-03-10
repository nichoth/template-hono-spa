# Data Model: Mobile Home Layout Usability

## Entity: MobileViewportProfile
- Description: Defines viewport ranges and mobile behavior expectations.
- Fields:
  - `name` (string): Profile label (for example, small-phone, medium-phone).
  - `minWidth` (number): Inclusive lower width bound.
  - `maxWidth` (number): Inclusive upper width bound.
  - `allowsHorizontalScroll` (boolean): Whether horizontal scroll is permitted.
  - `minReadableContentWidth` (number): Minimum content width threshold for readable layout.
- Validation rules:
  - Width ranges must not overlap.
  - `allowsHorizontalScroll` must be false for all mobile profiles in scope.
  - Each profile must support readable content presentation.

## Entity: LayoutBlock
- Description: A visual section in the mobile home experience (header, nav, card, control row).
- Fields:
  - `id` (string): Stable block identifier.
  - `type` (enum): header, navigation, card, control-group.
  - `isVisible` (boolean): Whether block remains visible on mobile.
  - `isTappable` (boolean): Whether interactive block remains usable.
  - `wrapBehavior` (enum): no-wrap, soft-wrap, multi-line.
- Validation rules:
  - Interactive blocks must remain tappable.
  - Wrapped content cannot overlap adjacent blocks.

## Entity: InteractionStabilityCheck
- Description: Validation event for repeated mobile interactions.
- Fields:
  - `actionType` (enum): counter-tap, nav-tap.
  - `cycles` (number): Number of repeated interactions performed.
  - `overlapDetected` (boolean): Whether overlap occurred.
  - `clippingDetected` (boolean): Whether clipping occurred.
  - `spacingBreakDetected` (boolean): Whether spacing collapsed.
- Validation rules:
  - `overlapDetected`, `clippingDetected`, and `spacingBreakDetected` must be false after validation cycles.

## Relationships
- `MobileViewportProfile` determines layout constraints for all `LayoutBlock` instances.
- `InteractionStabilityCheck` validates dynamic behavior of `LayoutBlock` under repeated interactions in a `MobileViewportProfile`.

## State Transitions
1. Home page loads in selected mobile viewport profile.
2. Layout blocks render with mobile constraints.
3. Repeated interactions occur; layout remains stable and readable without overflow.
