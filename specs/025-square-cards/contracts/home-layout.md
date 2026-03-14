# Home Layout Contract

## Route

- Home route component: `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- Home route stylesheet: `/Users/nick/code/template-hono-spa/src/client/routes/home.css`

## Required UI Behavior

- The home route renders exactly three content cards in their existing order.
- The card container exposes a single row with three columns as its preferred desktop layout.
- When the viewport cannot fit that row comfortably, horizontal scrolling is available on the card container instead of collapsing the cards into a taller layout.
- Each home card prefers a square footprint.
- A home card may become taller than square if its content would otherwise overlap, clip, or hide controls.

## Non-Goals

- No changes to route structure, card content order, or card interaction logic.
- No new API contracts or server behavior.
