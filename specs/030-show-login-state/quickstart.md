# Quickstart: Show login state

1. `npm install` (if dependencies not already installed).
2. `npm run dev` to launch the Vite dev server and worker shell.
3. Open the app in a desktop browser and sign in via the existing login or passkey flows.
4. Confirm the header shows `logged in as <email>` (the `.login-status` element) between the nav links and avatar once `/api/session` returns `authenticated:true`.
5. Clear the session or use an incognito window and reload; verify the header text switches to `logged in as anonymous`.
6. Resize the viewport below ~680px and ensure the `.login-status` element is hidden while the avatar and nav remain visible.
7. Run `npm test` to ensure the Vitest suite still passes after the UI change.
