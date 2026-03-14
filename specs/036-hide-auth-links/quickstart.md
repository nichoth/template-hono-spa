# Quickstart for Hide Auth Links

1. **Set up**
   - Start the dev server: `npm run dev`.
   - Ensure a test account exists (passkey or password login).

2. **Manual verification**
   - Visit `/login` and sign in with the test account.
   - Once authenticated, observe the header:
     - Desktop nav should list `Home` and `About` only; `Login`/`Create Account` disappear.
     - Mobile hamburger menu should open to the same filtered list.
   - Log out using the header control.
     - Verify both navs now show `Login` and `Create Account` again.
   - Repeat in incognito/mobile viewports to ensure responsive menus match.

3. **Regression checks**
   - Spin up Visual Regression capture of nav before and after login to ensure the auth link removal is deterministic.
   - Confirm `npm test` and `npm run lint` pass after implementation; no new tests are required beyond UI verification.
