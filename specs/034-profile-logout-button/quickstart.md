# Quickstart

1. Launch the Vite dev server (e.g., `npm run dev`) so the `/profile` route is available locally.
2. Sign in using the existing login flow so `SessionContext.isAuthenticated` becomes true.
3. Navigate to `http://localhost:8888/profile`, focus on the header/avatar area, and verify:
   - The logout button appears beside the avatar/text.
   - It follows desktop styling (font-size ≥1rem, consistent spacing).
4. Click the button; confirm the UI transitions to the landing/unauthenticated view within a second and no “logged in as” copy remains.
5. To test failure handling, temporarily block logout (e.g., disable the outgoing request or simulate a timeout) and verify that an error message appears near the button and the control re-enables for retry without refreshing the page.
