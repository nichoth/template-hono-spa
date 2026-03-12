# Feature Specification: Mobile Navigation

**Feature Branch**: `001-mobile-nav`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Please add mobile nave with `@substrate-system/hamburger-two` web component. See the docs: https://github.com/substrate-system/hamburger-two -- will tell you how to use it."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open navigation on mobile (Priority: P1)

As a mobile visitor, I can use a menu control in the top-right corner of the header to open the site navigation.

**Why this priority**: Mobile visitors need an obvious and reachable way to access navigation before any refinement to layout or behavior matters.

**Independent Test**: Open the site on a mobile-sized viewport and confirm that the header shows a menu control in the top-right corner which reveals the site navigation when activated.

**Acceptance Scenarios**:

1. **Given** the site is viewed on a mobile-sized screen, **When** the page loads, **Then** the header shows a navigation menu control in the top-right corner.
2. **Given** the site is viewed on a mobile-sized screen, **When** the visitor activates the menu control, **Then** the primary navigation links become visible and available for selection.

---

### User Story 2 - Use mobile navigation links without clutter (Priority: P2)

As a mobile visitor, I see navigation links inside the opened menu instead of spread across the header, so the top bar stays compact and readable.

**Why this priority**: The feature is meant to simplify the mobile header layout, not just add another control alongside the existing links.

**Independent Test**: Open the site on a mobile-sized viewport and confirm that the navigation links are hidden from the header until the menu is opened, then appear inside the menu.

**Acceptance Scenarios**:

1. **Given** the site is viewed on a mobile-sized screen, **When** the page first renders, **Then** the standard navigation links are not shown inline in the header.
2. **Given** the mobile menu is open, **When** the visitor views the menu contents, **Then** the same primary navigation destinations are available inside the menu.

---

### User Story 3 - Preserve existing navigation on larger screens (Priority: P3)

As a desktop visitor, I continue to use the current header navigation without being forced into the mobile menu pattern.

**Why this priority**: The request is specifically about improving mobile navigation, so larger-screen navigation should remain familiar and stable.

**Independent Test**: Open the site on a desktop-sized viewport and confirm that the current inline header navigation remains available without relying on the mobile menu interaction.

**Acceptance Scenarios**:

1. **Given** the site is viewed on a desktop-sized screen, **When** the page loads, **Then** the current inline navigation remains visible in the header.
2. **Given** the site is viewed on a desktop-sized screen, **When** the visitor navigates between pages, **Then** navigation continues to behave the same way it did before the mobile-nav change.

### Edge Cases

- If the menu is opened on mobile and the visitor selects a destination, the navigation should not remain visually stuck in its open state on the next page view.
- If the current page is already active, the navigation should still clearly indicate which destination is selected whether the links are shown inline or inside the mobile menu.
- If the viewport changes between mobile and desktop sizes, the navigation presentation should update without leaving duplicate links visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a compact navigation control in the top-right area of the header when the site is viewed on a mobile-sized screen.
- **FR-002**: The system MUST reveal the primary navigation links when the mobile navigation control is activated.
- **FR-003**: The system MUST place primary navigation links inside the mobile navigation menu instead of displaying them inline in the mobile header.
- **FR-004**: The system MUST allow visitors to access all existing primary navigation destinations through the mobile navigation menu.
- **FR-005**: The system MUST preserve clear indication of the currently active destination within the navigation.
- **FR-006**: The system MUST keep the existing inline navigation pattern available on larger screens.
- **FR-007**: The system MUST avoid showing duplicate primary navigation presentations for the same viewport state.
- **FR-008**: The mobile navigation interaction MUST remain available on every page that currently uses the shared site header.

### Key Entities *(include if feature involves data)*

- **Navigation Presentation State**: The current navigation mode for the active viewport, such as inline header navigation or mobile menu navigation.
- **Navigation Menu Item**: A destination displayed within navigation, including its label, target, and active-state indication.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of validated mobile-sized page loads show a visible navigation control in the top-right header area.
- **SC-002**: 100% of validated mobile-sized page loads keep primary navigation links out of the inline header until the menu is opened.
- **SC-003**: 100% of validated desktop-sized page loads preserve the existing inline navigation experience.
- **SC-004**: Visitors can reach every existing primary navigation destination from mobile and desktop layouts during verification.

## Assumptions

- The change applies to the shared site header already used across app pages.
- Mobile behavior should focus on compact screens, while larger screens should keep the current inline navigation presentation.
- The set of primary navigation destinations does not change as part of this feature; only their presentation changes by viewport.
