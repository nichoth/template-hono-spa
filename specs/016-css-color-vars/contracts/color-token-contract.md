# Contract: Shared Color Token Usage

## Purpose

Define the repository-owned styling contract for how maintained UI styles consume shared color values.

## Contract Rules

1. All maintained application color usage must reference a shared CSS custom property.
2. Shared color token names must describe semantic purpose rather than a specific page or component.
3. Any new semantic color need must be introduced as a shared token before it is used in maintained styles.
4. Maintained styles must not introduce direct hexadecimal, RGB, HSL, or raw named color values for UI color properties.
5. Existing status meanings must remain stable:
   - Primary tokens identify interactive emphasis.
   - Success tokens identify positive state.
   - Warning tokens identify caution state.
   - Error tokens identify validation or failure state.
   - Inverse tokens identify high-contrast styling on dark surfaces.

## Covered Surfaces

- Global application styles in [src/style.css](/Users/nick/code/template-hono-spa/src/style.css)
- Shared component styles in [src/client/components/nav.css](/Users/nick/code/template-hono-spa/src/client/components/nav.css) and [src/client/components/card.css](/Users/nick/code/template-hono-spa/src/client/components/card.css)
- Route styles in [src/client/routes/home.css](/Users/nick/code/template-hono-spa/src/client/routes/home.css), [src/client/routes/login.css](/Users/nick/code/template-hono-spa/src/client/routes/login.css), and [src/client/routes/profile.css](/Users/nick/code/template-hono-spa/src/client/routes/profile.css)

## Verification

- Automated checks should fail if maintained styles introduce blocked direct color patterns.
- The repository regression check for this rule lives in [/Users/nick/code/template-hono-spa/test/unit.spec.ts](/Users/nick/code/template-hono-spa/test/unit.spec.ts) and scans the maintained stylesheet set called out above.
- Manual review should confirm shared semantic meanings remain visually consistent across the main routes and mobile navigation states.
