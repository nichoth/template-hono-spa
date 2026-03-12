# Phase 0 Research: Mobile Navigation

## Decision 1: Keep route definitions unchanged and adapt only the shared navigation presentation

- **Decision**: Reuse the existing centralized route metadata from [src/client/routes/index.ts](/Users/nick/code/template-hono-spa/src/client/routes/index.ts) and change only how those links are displayed across mobile and desktop layouts.
- **Rationale**: The feature is explicitly about navigation presentation, not changing the available destinations. Reusing the current `routes` list keeps the menu contents aligned with the existing inline nav and avoids duplicating navigation definitions.
- **Alternatives considered**:
  - Create a separate mobile-only route list: rejected because it risks drift from the primary navigation metadata.
  - Move navigation definitions into the hamburger component: rejected because the component is only a trigger and event source, not a route registry.

## Decision 2: Integrate `@substrate-system/hamburger-two` through the existing client bootstrap and stylesheet pattern

- **Decision**: Register `HamburgerTwo` in the client bootstrap, import the package CSS into the shared stylesheet, and use the component’s documented open/close events to toggle a separate mobile navigation container.
- **Rationale**: The installed package’s README documents a specific client-only pattern: import CSS, call `.define()`, and respond to `HamburgerTwo.event('open')` and `HamburgerTwo.event('close')` by showing or hiding application-owned menu content. That matches the project’s existing pattern for registering Substrate web components in [src/client/index.ts](/Users/nick/code/template-hono-spa/src/client/index.ts) and importing shared component CSS in [src/style.css](/Users/nick/code/template-hono-spa/src/style.css).
- **Alternatives considered**:
  - Hide/show links purely with CSS and no event handling: rejected because the component is documented as a trigger that application code should wire to its menu state.
  - Build a custom hamburger interaction instead of using the installed package: rejected because it would ignore the user’s requested component.

## Decision 3: Use responsive CSS to swap between inline desktop navigation and hamburger-driven mobile navigation

- **Decision**: Keep the current inline nav visible on larger screens and switch to a mobile menu presentation on compact viewports, with the trigger in the top-right header area.
- **Rationale**: The spec explicitly preserves larger-screen behavior and limits the layout change to mobile. Responsive CSS is the smallest change that can hide inline links on mobile, reveal the hamburger trigger, and keep only one navigation presentation active per viewport state.
- **Alternatives considered**:
  - Use the hamburger trigger on all screen sizes: rejected because it would degrade the existing desktop flow.
  - Keep inline links visible on mobile alongside the menu: rejected because it would violate the clutter-reduction goal and create duplicate navigation presentations.

## Decision 4: Extend current route and shell tests instead of introducing a new test harness

- **Decision**: Add navigation-focused assertions to the existing unit and integration suites rather than introducing browser automation.
- **Rationale**: [test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) already covers route metadata and render-source assertions, and [test/integration.spec.ts](/Users/nick/code/template-hono-spa/test/integration.spec.ts) already covers shared shell behavior for app routes. The mobile-nav feature fits those existing seams.
- **Alternatives considered**:
  - Add a browser-level responsive layout suite: rejected for this phase because the repo’s current automated verification relies on unit and worker integration tests.
  - Rely only on manual responsive checks: rejected because navigation presentation is a shared header behavior that should have regression coverage.
