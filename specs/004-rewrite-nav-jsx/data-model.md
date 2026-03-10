# Data Model: Navigation JSX Rewrite

## Entity: NavigationItem

- **Description**: Displayable navigation entry rendered in the primary header navigation.
- **Fields**:
  - `href`: string (destination path)
  - `label`: string (visible link text)
  - `isActive`: boolean (derived from current normalized route)
- **Validation Rules**:
  - `href` must begin with `/` and represent an app-recognized path or intentionally handled fallback path.
  - `label` must be non-empty and human-readable.
  - `href` values should be unique across rendered navigation items.
- **State Transitions**:
  - `inactive -> active` when current route matches `href`
  - `active -> inactive` when current route changes away from `href`

## Entity: NavigationViewModel

- **Description**: Render-ready collection of navigation items for header display.
- **Fields**:
  - `items`: `NavigationItem[]`
  - `currentPath`: string
- **Validation Rules**:
  - `items` collection must be deterministic for a given route and config.
  - `currentPath` is normalized before active-state comparisons.
- **State Transitions**:
  - `items` remain stable while `currentPath` changes with navigation events.

## Entity: RouteState

- **Description**: Current route value used to compute active navigation state.
- **Fields**:
  - `rawPath`: string
  - `normalizedPath`: string (query string removed)
- **Validation Rules**:
  - `normalizedPath` defaults to `/` when empty.
  - `normalizedPath` is used for active navigation comparisons.
- **State Transitions**:
  - `normalizedPath` updates whenever route signal/state changes.
