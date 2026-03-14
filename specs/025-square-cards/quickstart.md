# Quickstart: Square Home Cards

## Implementation Scope

- Modify `/Users/nick/code/template-hono-spa/src/client/routes/home.css` to use a scrollable three-column layout for the home cards.
- Modify `/Users/nick/code/template-hono-spa/src/client/components/card.css` only if the shared card container needs a square preferred aspect ratio or overflow adjustments that are still safe for current usage.
- Add or update Vitest assertions in `/Users/nick/code/template-hono-spa/test/unit.spec.ts` to lock the layout contract to the home route.

## Verification

1. Run `npm test`
2. Run `npm run lint`
3. Run `npm start`
4. Open `http://127.0.0.1:8888/`
5. Confirm the home route shows one horizontal row of three square-preferred cards at the reference desktop size
6. Narrow the viewport and confirm horizontal scrolling appears before the cards collapse into tall stacked rectangles
7. Trigger the fetch card and confirm the buttons and JSON output remain readable if the card grows taller than square
