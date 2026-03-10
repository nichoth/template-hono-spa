# Feature Specification: Rewrite Navigation Component in Project-Consistent Syntax

**Feature Branch**: `004-rewrite-nav-jsx`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "Please rewrite `src/components/nav.ts` so that it is correct for this repo -- jsx, not template literals"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Reliably Across Pages (Priority: P1)

As a site visitor, I can use the navigation links and consistently reach the intended page from any view.

**Why this priority**: Reliable navigation is core to basic site usability and must work before any visual or maintainability improvements matter.

**Independent Test**: Can be fully tested by loading the app, selecting each nav link, and confirming the destination and active state are correct.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** a user selects a navigation item, **Then** the app shows the matching destination content.
2. **Given** the user is already on a destination represented in the navigation, **When** the nav is rendered, **Then** the corresponding item is clearly indicated as active.

---

### User Story 2 - Maintain Navigation Safely (Priority: P2)

As a developer, I can update labels, paths, and ordering in the navigation component using the project's standard UI authoring style without introducing rendering regressions.

**Why this priority**: This directly reduces maintenance risk and prevents future style mismatches in a shared codebase.

**Independent Test**: Can be fully tested by editing one nav item (label or path), running tests/build checks, and confirming behavior remains correct.

**Acceptance Scenarios**:

1. **Given** a developer updates one navigation item, **When** the app is built and tested, **Then** the component compiles and renders correctly without style-mismatch errors.
2. **Given** a new developer reads the component, **When** they compare it with other UI components in the repo, **Then** they can recognize and follow the same authoring pattern.

### Edge Cases

- A navigation item points to an unknown or unavailable route.
- The current location does not match any configured navigation item.
- Navigation configuration includes an empty label or duplicate destination.

## Assumptions

- Existing route paths and labels are already valid and should be preserved unless necessary to keep navigation working.
- Any current accessibility cues in navigation (such as active indication text or attributes) should remain intact.
- The change is limited to navigation component behavior and authoring consistency, not broader information architecture changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render the primary navigation using the same UI component authoring pattern used across this repository.
- **FR-002**: The system MUST preserve existing navigation destinations and labels unless a mismatch prevents correct navigation behavior.
- **FR-003**: Users MUST be able to select each navigation item and reach the intended destination.
- **FR-004**: The system MUST provide a visible active-state indicator for the currently selected destination.
- **FR-005**: The system MUST handle unmatched or invalid navigation destinations gracefully without breaking the page shell.
- **FR-006**: The navigation component MUST remain readable and maintainable so a developer can safely update items without introducing syntax-style inconsistencies.

### Key Entities *(include if feature involves data)*

- **Navigation Item**: A single entry shown in primary navigation, containing a display label, destination, and active-state eligibility.
- **Navigation State**: The current location context used to determine which navigation item is active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of configured navigation items lead users to the intended destination during acceptance testing.
- **SC-002**: 100% of tested app locations that map to a navigation item show a correct active-state indicator.
- **SC-003**: The updated navigation component can be modified for at least one label/path change and pass the project verification suite with no navigation-related failures.
- **SC-004**: At least 1 reviewer unfamiliar with the prior implementation confirms the component follows the same authoring style as other UI components in the repo.
