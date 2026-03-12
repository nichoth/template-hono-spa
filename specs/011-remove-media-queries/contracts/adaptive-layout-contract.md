# Contract: Adaptive Layout Without Media Queries

## Interface Type
UI layout behavior contract for the primary application shell and route content regions.

## Scope
Defines observable layout expectations across viewport sizes and zoom levels when media queries are not used.

## Contract Requirements
1. Primary pages must adapt layout continuously from narrow to wide viewports without media-query rules.
2. Card grid regions must auto-adjust column count based on available width and keep content readable.
3. Main page content must not require horizontal page scrolling at common viewport widths (320px-1920px).
4. Primary navigation links and actions must remain visible and operable during viewport resize and at 200% zoom.
5. Long text content must wrap or reflow without clipping critical information or overlapping adjacent content.
6. Existing route behavior and non-layout feature behavior remain unchanged.

## Acceptance Scenarios
1. Narrow viewport adaptation:
   - Given a 320px viewport,
   - When a primary route loads,
   - Then content renders in a readable flow with no horizontal scrolling.
2. Wide viewport adaptation:
   - Given a desktop-width viewport,
   - When card content is shown,
   - Then grid regions render multiple columns without overlap or excessive dead space.
3. Resize continuity:
   - Given an open page,
   - When width is changed gradually across device sizes,
   - Then layout transitions occur through intrinsic reflow rather than breakpoint jumps.
4. Zoom accessibility:
   - Given 200% browser zoom,
   - When navigating primary routes,
   - Then primary links/actions remain visible and usable.

## Out of Scope
- New routes, endpoint changes, or business-logic updates.
- Copy/content redesign.
- Theme or brand redesign unrelated to layout adaptation.
