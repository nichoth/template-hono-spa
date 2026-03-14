# Quickstart: Testing the Email Confirmation Route

1. **Run the dev worker**: `npm run dev` (starts Vite + Hono worker).  
2. **Capture a confirmation link**: Complete the passkey signup flow and look for the `/confirm/<code>` URL printed in the terminal (or delivered in the real email).  
3. **Visit the route**: Open `http://localhost:8888/confirm/<code>` in your browser.  
4. **Observe the UI**: The confirm view shows a loading banner, posts `{ code, identifier }` to `/api/confirm`, then transitions to the success banner with the resolved identifier and a “Go to Login” CTA once the API responds.  
5. **Test errors**: Replace the code in the URL with something invalid or expired; the error panel should remain on `/confirm/<code>`, render the API-provided message, expose the “Request a new link” action, and keep login/resend links keyboard focusable.  
6. **Manual hit**: Visit `/confirm` (no code); the guidance panel should display immediately without calling `/api/confirm`, and the CTAs should point to login/search.  
7. **Accessibility check**: Use `tab`/screen reader to ensure the `confirm-panel` receives focus on updates, `aria-live` announces the banner text, and all CTA links are reachable via keyboard navigation.
