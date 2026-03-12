# Mobile Navigation UI Contract

## Overview

This feature changes the shared site header so compact screens use a dedicated menu trigger and menu container for primary navigation, while larger screens keep the current inline nav.

## Header Presentation Contract

- **Mobile-sized viewports**:
  - Show a navigation trigger in the top-right area of the shared header
  - Do not show primary navigation links inline in the header before the menu opens
  - Reveal primary navigation links inside the mobile menu when the trigger is activated

- **Desktop-sized viewports**:
  - Keep the existing inline primary navigation visible in the shared header
  - Do not require the mobile menu interaction for normal navigation

## Interaction Contract

1. **Given** a mobile-sized viewport, **When** the page loads, **Then** the menu trigger is visible in the header.
2. **Given** a mobile-sized viewport, **When** the visitor activates the trigger, **Then** the mobile navigation links become visible.
3. **Given** a mobile-sized viewport, **When** the mobile menu is closed, **Then** inline navigation links are not shown in the header.
4. **Given** a desktop-sized viewport, **When** the page loads, **Then** the inline navigation remains available without the mobile menu.
5. **Given** any viewport, **When** navigation is rendered, **Then** the active destination remains visually identifiable.

## Non-Goals

- No change to the set of primary navigation destinations
- No change to route ownership or route definitions
- No authentication, authorization, or API behavior changes
