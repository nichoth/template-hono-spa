# Quickstart: Signup Navigation And Confirmation

## Implementation Scope

- Add `Create Account` to the shared nav route metadata so it appears in the top navigation.
- Update `/Users/nick/code/template-hono-spa/src/client/routes/signup.ts` and `/Users/nick/code/template-hono-spa/src/client/routes/signup.css` so the signup screen mirrors the login method selector and consistently uses `Create account` actions.
- Update the registration flow in `/Users/nick/code/template-hono-spa/src/client/state.ts`, `/Users/nick/code/template-hono-spa/src/server/auth/index.ts`, and `/Users/nick/code/template-hono-spa/src/server/index.ts` so successful signup leads to confirmation-email guidance instead of an authenticated session.
- Add or update tests in `/Users/nick/code/template-hono-spa/test/unit.spec.ts` and `/Users/nick/code/template-hono-spa/test/integration.spec.ts`.

## Verification

1. Run `HOME=/tmp npm run lint`
2. Run `HOME=/tmp npm test`
3. Run `HOME=/tmp npm start`
4. Open `http://127.0.0.1:8888/`
5. Confirm the top navigation shows `Create Account`
6. Click `Create Account` and verify the app reaches `/signup` without a full-page reload
7. Confirm `/signup` shows the same passkey/password method choice pattern as `/login`
8. Confirm the primary action text says `Create account`
9. Submit a successful signup path and verify the UI tells the user to confirm their email address
10. Submit an invalid signup path and verify actionable route-local feedback appears
