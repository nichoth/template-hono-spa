# Custom media breakpoint usage design

## Overview
- Purpose: Replace the raw `@media (max-width: 679px)` switch in `src/style.css` with the existing `--small` custom media defined in `src/_variables.css` so the LightningCSS pipeline manages the breakpoint centrally.
- Scope: Only the header `.login-status` responsive rule needs the change; no other layout adjustments are required.

## Layout & Styling
- Keep the surrounding CSS block intact but swap `@media (max-width: 679px)` for `@media (--small)`. This maintains the same shadow (width <= 680px) while referencing the shared custom variable.
- No other selectors or properties change; the `.login-status` rule remains inside the header definition.

## Data & Interaction
- No JavaScript/state change is required because the responsive behavior already relies on CSS breakpoints; the only change is referencing the shared custom media name so future breakpoint updates flow through `src/_variables.css`.

## Testing & Validation
- Render the page, shrink the viewport below the small breakpoint, and confirm `.login-status` hides as before.
- Run the existing Vitest stylesheet parsing checks to ensure the CSS change compiles through LightningCSS without errors.
