# Data Model: Client-Side Routing Integration

## Entity: ClientRouteDefinition

- **Description**: Route entry used by client-side navigation to determine view mapping and transition behavior.
- **Fields**:
  - `path`: string
  - `displayLabel`: string
  - `componentRef`: route component reference
- **Validation Rules**:
  - `path` values must be unique among client-managed routes.
  - `path` values should align with router matching entries.
  - `componentRef` must map to a valid render target.
- **State Transitions**:
  - `registered -> active` (when navigated)
  - `active -> inactive` (when user navigates elsewhere)

## Entity: NavigationState

- **Description**: Current client route context used to render app content and sync history behavior.
- **Fields**:
  - `currentPath`: string
  - `previousPath`: string
  - `historyMode`: enum (`push`, `replace`, `pop`)
  - `notFoundFallback`: boolean
- **Validation Rules**:
  - `currentPath` must always be set after app initialization.
  - `notFoundFallback` must be true only when route does not match defined client routes.
- **State Transitions**:
  - `initialized -> routed`
  - `routed -> not_found`

## Entity: ServerEndpointRoute

- **Description**: Server-handled route that remains outside client-side routing responsibilities.
- **Fields**:
  - `path`: string
  - `type`: enum (`api`, `health`)
  - `availability`: boolean
- **Validation Rules**:
  - Server endpoint paths must not conflict with client route-definition ownership.
  - `availability` should remain true for required operational endpoints.
