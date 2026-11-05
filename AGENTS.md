# Development Guidelines

## Project

The repository currently contains a web application starter,
including authentication. Do not invent product requirements.
Consult the existing code and clarify consequential scope decisions as needed.

The application uses a Cloudflare Worker and Hono for the backend, with a
client-rendered Preact SPA. The existing stack includes TypeScript, `htm`,
`@preact/signals`, Cloudflare D1, and passkeys.

## Working agreements

- Keep lines under 80 columns; break lines cleanly.
- Write as little code as practical. Prefer a free Cloudflare service when it
  meets the requirement.
- Do not add dependencies without asking first.
- Use `@preact/signals` for all client-side application state. Attach functions
  that modify state to the `State` object, following the existing template.
- Do not use CSS `border-radius` except for icons or icon buttons.
- Define all CSS colors as variables in a global color set; do not introduce
  page-specific or context-specific colors.
- Follow the existing TypeScript and ESM conventions.

## Structure and commands

- `src/client/` contains the frontend; `src/server/` contains the backend.
- `tests/` contains tests.
- Install dependencies with `npm install` and start development with
  `npm start`.
- Run `npm run build` before `npm test`: the test Worker's `ASSETS` binding
  serves `public/client/`. Run `npm run lint` as well.
- Never write build output into `_public/`. It is Vite's `publicDir`, and an
  `index.html` there overrides the source document in the dev server.

## Frontend

The frontend uses a pattern that separates "views" from state / logic.
The view code listens for event from the DOM, and then calls a function exposed
by `src/client/state/index.ts`, a different function within
`src/client/state/*.ts`. View code (anything that touches the DOM) should
never set signals directly. IE, there should never be a file that renders
the DOM and also sets `.value` on a signal.

The only place in the code that can assign to `signal.value` is
in `src/client/state/index.ts`, or a subfolder of `src/client/state`.
