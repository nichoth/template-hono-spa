# Contract: Navigation Component Rendering and Behavior

## Interface

- **Name**: Navigation Component Contract
- **Consumer**: Browser users and developers maintaining header navigation
- **Provider**: `Nav` component and associated route/auth state inputs

## Preconditions

- Application route state is available for active-link evaluation.
- Navigation items have valid labels and destination paths.
- Header shell renders the navigation component in app layout.

## Guaranteed Behavior

1. The navigation renders a stable list of configured links with readable labels.
2. Selecting a navigation link routes the user to the intended destination.
3. The currently matched destination is visibly marked as active.
4. Invalid or unmatched paths do not break the page shell or prevent nav rendering.

## Verification Signals

- Route click-through checks confirm expected destination content.
- Active marker updates when current route changes.
- Lint/test verification is executed after component syntax migration.
- Header navigation remains visible across known routes.

## Out of Scope

- Global route architecture redesign.
- New navigation information architecture (new pages/labels beyond maintenance updates).
