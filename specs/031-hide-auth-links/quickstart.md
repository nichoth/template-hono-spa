# Quickstart: Hide auth links

1. `npm install` (if dependencies are not already installed).
2. `npm run dev` to start the Vite dev server and worker shell.
3. Open the app in a desktop browser, sign in, and reload the home page.
4. Confirm the header's navigation list (desktop and mobile) no longer contains the Login or Create Account entries while the other links (Home, About, etc.) remain.
5. Open the app in a fresh browser or incognito tab (no session); verify the Login and Create Account links are present again.
6. Shrink the viewport below ~680px, open the mobile menu, and verify the same filtered navigation appears when authenticated.
7. Run `npm test` to ensure the Vitest suite still passes after the navigation filtering changes.
