# Feature Specification: Custom media breakpoint usage

**Feature Branch**: `[032-custom-media-breakpoints]`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "In src/style.css, line 139, you use a media query, `@media (max-width: 679px)`. Please use the existing custom media breakpoint variables defined in src/_variables.css. The lightningcss is setup to compile them correctly."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep desktop-to-mobile breakpoint in sync (Priority: P1)

Designers and developers need the `.login-status` mobile rule to rely on the shared `--small` custom media so that future breakpoint tweaks happen in one place.

**Why this priority**: Keeping breakpoint definitions centralized avoids drift between CSS and LightningCSS-managed variables, delivering consistent responsive behavior.

**Independent Test**: Open the homepage, shrink the viewport to the small breakpoint, and confirm the `.login-status` text hides exactly as before while the rest of the header remains intact.

**Acceptance Scenarios**:

1. **Given** the viewport width is below or equal to the `--small` threshold (<= 680px), **when** LightningCSS compiles `src/style.css`, **then** the `.login-status` rule is wrapped in `@media (--small)` and the text is hidden on small screens.
2. **Given** the viewport width is above the `--small` threshold, **when** the page loads, **then** the `.login-status` text remains visible because the custom media resolves to false.

---

### Edge Cases

- What happens if LightningCSS renames the custom media? Documented variables ensure this change occurs in `src/_variables.css`, so no code changes are required.
- If other rules rely on the `--small` media, they remain untouched because only the `.login-status` block is updated.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `.login-status` desktop header rule MUST be enclosed in `@media (--small)` instead of `@media (max-width: 679px)`.
- **FR-002**: No other selectors or properties inside the header block may change, ensuring only the breakpoint reference is updated.
- **FR-003**: The `--small` custom media MUST map to the existing `width <= 680px` definition in `src/_variables.css` so behaviour remains identical.
- **FR-004**: LightningCSS must compile the new custom media usage without emitting errors (tested via the existing Vitest suite).
- **FR-005**: Documentation (quickstart or README) MUST mention the move to `--small` so future authors know the CSS variable to touch for breakpoint tweaks.

### Key Entities *(include if feature involves data)*

- **Header Layout**: Stylings in `src/style.css` that position the nav, avatar; the `.login-status` rule is within this entity.
- **Custom media variables**: Definitions in `src/_variables.css` that LightningCSS transpiles; `--small` maps to `width <= 680px`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When the viewport width is at or below the currently defined small breakpoint, the `.login-status` text is hidden after compiling via LightningCSS.
- **SC-002**: Running `npm test` (which exercises CSS checks) succeeds after the breakpoint change, demonstrating compatibility.
- **SC-003**: The reference to `@media (--small)` appears in `src/style.css` without introducing additional selectors or layout shifts.
- **SC-004**: Designers can adjust the small breakpoint inside `src/_variables.css` and expect `.login-status` to follow without further edits.
