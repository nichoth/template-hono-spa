# Data Model: Custom media breakpoint usage

## Entities

### Header style block
- **Fields**:
  - `.login-status` selector: includes display/visibility controls for the authenticated indicator.
  - `@media` wrapper: currently wraps the selector to hide it below the small breakpoint.
- **Validation rules**:
  - Must use `@media (--small)` so LightningCSS picks up the shared breakpoint definition.
  - Should not remove other rules or selectors inside the header block.

### Custom media definitions
- **Fields**:
  - `--small`: defined in `src/_variables.css` as `(width <= 680px)`.
  - Other breakpoints (`--medium`, `--large`) exist but are unchanged.
- **Relationships**:
  - The header style references `--small` to keep responsive behavior consistent.
