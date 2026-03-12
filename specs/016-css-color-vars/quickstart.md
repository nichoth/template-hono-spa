# Quickstart: Shared Color Variables

## Prerequisites

- Install dependencies in the repository root
- Work from branch `016-css-color-vars`

## Automated Validation

1. Run lint:

```sh
cd /Users/nick/code/template-hono-spa && npm run lint
```

2. Run the full test suite:

```sh
cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test
```

3. Run the focused stylesheet regression check while iterating on color changes:

```sh
cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test -- test/unit.spec.ts -t "keeps maintained stylesheets free of direct color literals"
```

## Manual Validation

1. Start local development:

```sh
cd /Users/nick/code/template-hono-spa && npm start
```

2. Open `http://127.0.0.1:8888/`, `http://127.0.0.1:8888/about`, and `http://127.0.0.1:8888/login`.

3. Confirm the following visual behaviors remain intact:
   - Body background and main text colors match the current site appearance
   - Header title, avatar ring, and focus styling still read clearly
   - Mobile navigation overlay and controls still show high-contrast inverse styling
   - Login validation feedback still appears with distinct error emphasis

4. Inspect representative shared styles in the browser devtools or source view.
   - Expect color-related declarations to resolve from CSS custom properties rather than direct literals in maintained stylesheets
   - The maintained stylesheet scope for this feature is `src/style.css`, `src/client/components/card.css`, `src/client/components/nav.css`, `src/client/routes/home.css`, `src/client/routes/login.css`, and `src/client/routes/profile.css`

5. Change one shared color token in the local stylesheet and refresh.
   - Expect every usage of that semantic token to update together without extra per-component edits

## Validation Log

- 2026-03-12: Planning artifacts prepared for shared color tokenization.
- 2026-03-12: `npm run lint` passed from `/Users/nick/code/template-hono-spa`.
- 2026-03-12: `HOME=/tmp npm test` passed from `/Users/nick/code/template-hono-spa` with 51 tests passing, including the maintained stylesheet color-literal regression check in `test/unit.spec.ts`.
- 2026-03-12: Manual browser validation was not executed in this terminal session.
