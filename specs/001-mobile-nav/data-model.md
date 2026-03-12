# Data Model: Mobile Navigation

## Entity: NavigationPresentationState

- **Purpose**: Represents how navigation is currently exposed to the visitor based on viewport and menu state.
- **Fields**:
  - `mode`: whether navigation is shown inline or through the mobile menu
  - `menuOpen`: whether the mobile menu is currently visible
  - `activeDestination`: the current page destination highlighted in navigation
- **Validation rules**:
  - Only one navigation presentation is active for a given viewport state
  - `menuOpen` is meaningful only in mobile navigation mode

## Entity: NavigationMenuItem

- **Purpose**: Represents a primary destination rendered in either desktop inline navigation or the mobile menu.
- **Fields**:
  - `href`: destination link
  - `text`: visible navigation label
  - `isActive`: whether the current page matches the destination
- **Relationships**:
  - Multiple `NavigationMenuItem` entries belong to one `NavigationPresentationState`

## State Transitions

1. **Desktop Inline**: Larger-screen layout shows the primary navigation links inline in the header.
2. **Mobile Closed**: Compact layout shows only the mobile menu trigger in the header.
3. **Mobile Open**: Compact layout shows the mobile menu contents after the trigger is activated.
4. **Mobile Navigate/Close**: The mobile menu returns to the closed presentation after the interaction completes or the visitor changes pages.
