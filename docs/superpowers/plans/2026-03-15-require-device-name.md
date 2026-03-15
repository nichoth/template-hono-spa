# Require Device Name Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development
> (if subagents available) or superpowers:executing-plans to implement this plan.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make device name required end-to-end — the "Add device" button
is disabled until a name is entered, and the server rejects requests
that omit a name.

**Architecture:** The frontend already disables the button (done in the
current branch). The remaining work is: tighten the TypeScript
signatures to treat `deviceName` as required at every layer, add a
server-side guard in the auth service, and update the one test that
currently asserts name-less invitations are valid.

**Tech Stack:** TypeScript (ES2022), Preact + @preact/signals (frontend),
Hono (server), Vitest (tests), Cloudflare Workers + D1

---

## File Map

| File | Change |
|------|--------|
| `src/server/auth/index.ts` | `createDeviceInvitation`: make `deviceName` required; add validation guard |
| `src/server/index.ts` | Route body type: `deviceName?:string` → `deviceName:string` |
| `src/client/state.ts` | `State.createInvite` signature: `deviceName?:string` → `deviceName:string` |
| `src/client/routes/profile.ts` | Call site: remove `|| undefined` fallback; pass trimmed name directly |
| `test/integration.spec.ts` | Update `'creates an unnamed invitation when no name is given'` test; add route-level 400 test |

---

## Chunk 1: Backend Validation

### Task 1: Guard in `createDeviceInvitation`

**Files:**
- Modify: `src/server/auth/index.ts:678-757`
- Test: `test/integration.spec.ts` (describe `'Device invitation name'`)

- [ ] **Step 1: Write the failing test**

  In `test/integration.spec.ts`, inside `describe('Device invitation
  name', ...)`, replace the existing
  `'creates an unnamed invitation when no name is given'` test body
  so it expects an `AuthError` instead of success:

  ```ts
  it(
      'rejects creating an invitation without a device name',
      async () => {
          const db = env.AUTH_DB
          await db.batch(
              AUTH_SCHEMA_STATEMENTS.map(s => db.prepare(s))
          )

          const authService = createAuthService()
          const userId = crypto.randomUUID()

          await db.prepare(
              'INSERT INTO users'
              + ' (id, handle, identifier,'
              + '  status, created_at, updated_at)'
              + ' VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(
              userId,
              'invite-noname-handle',
              'invite-noname@example.com',
              'active',
              Date.now(),
              Date.now(),
          ).run()

          await expect(
              authService.createDeviceInvitation(
                  db,
                  'http://localhost/add',
                  userId,
                  // no name passed
              )
          ).rejects.toMatchObject({
              status: 400,
              code: 'missing_device_name',
          })
      }
  )
  ```

- [ ] **Step 2: Run the test, confirm it fails**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A5 "rejects creating"
  ```

  Expected: test fails (currently name is optional, no error is thrown).

- [ ] **Step 3: Add the validation guard to `createDeviceInvitation`**

  In `src/server/auth/index.ts`, change the function signature and
  add the guard immediately after `await ensureAuthSchema(db)`:

  ```ts
  async function createDeviceInvitation (
      db:D1Database,
      requestUrl:string,
      userId:string,
      deviceName:string,   // was deviceName?:string
  ):Promise<InvitationResponse> {
      await ensureAuthSchema(db)

      if (!deviceName || !deviceName.trim()) {
          throw new AuthError(
              400,
              'missing_device_name',
              'Device name is required.',
          )
      }

      // ... rest unchanged
  ```

- [ ] **Step 4: Run the test, confirm it passes**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A5 "rejects creating"
  ```

  Expected: PASS.

- [ ] **Step 5: Commit**

  ```sh
  git add src/server/auth/index.ts test/integration.spec.ts
  git commit -m "feat: require device name in createDeviceInvitation"
  ```

---

### Task 2: Tighten the Route Handler

**Files:**
- Modify: `src/server/index.ts:302-341`
- Test: `test/integration.spec.ts` (new HTTP-level test)

- [ ] **Step 1: Write the failing HTTP test**

  Add a new `it` block to the integration suite (place it next to the
  other route-level tests) that sends a POST without a `deviceName`
  and expects a 400 response:

  ```ts
  it(
      'POST /api/auth/passkey/devices/invite returns 400 '
      + 'when deviceName is missing',
      async () => {
          // Arrange: create a passkey session
          // (copy the session-cookie setup pattern used by
          //  nearby tests in the file)
          const db = env.AUTH_DB
          await db.batch(
              AUTH_SCHEMA_STATEMENTS.map(s => db.prepare(s))
          )

          // Register a passkey user and get a session cookie
          // (reuse the helper pattern already in this file)
          const { sessionCookie } =
              await createPasskeyUserWithSession(db)

          const res = await SELF.fetch(
              'http://localhost'
              + '/api/auth/passkey/devices/invite',
              {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      Cookie: sessionCookie,
                  },
                  body: JSON.stringify({}),
              },
          )

          expect(res.status).toBe(400)
          const body = await res.json<{ error:string }>()
          expect(body.error).toBe('missing_device_name')
      }
  )
  ```

  > Note: look at the existing pattern in the file for how passkey
  > users are created and session cookies obtained —
  > `createPasskeyUserWithSession` may already exist as a helper, or
  > you may need to inline the setup. Match whatever pattern the file
  > uses.

- [ ] **Step 2: Run the test, confirm it fails**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A5 "returns 400"
  ```

  Expected: FAIL (route currently does not validate).

- [ ] **Step 3: Update the route body type**

  In `src/server/index.ts` at the invite route, change the body type:

  ```ts
  // before
  const body = await c.req.json<{
      deviceName?:string;
  }>()

  // after
  const body = await c.req.json<{
      deviceName:string;
  }>()
  ```

  The validation error now propagates from `createDeviceInvitation`
  through `authErrorResponse` — no additional code needed in the
  route handler.

- [ ] **Step 4: Run the test, confirm it passes**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A5 "returns 400"
  ```

  Expected: PASS.

- [ ] **Step 5: Commit**

  ```sh
  git add src/server/index.ts test/integration.spec.ts
  git commit -m "feat: route validates deviceName is present"
  ```

---

## Chunk 2: Client-Side Cleanup

### Task 3: Tighten `State.createInvite` Signature

**Files:**
- Modify: `src/client/state.ts:379-395`
- Modify: `src/client/routes/profile.ts:100-123` (call site)

No new tests needed here — the button disabled logic (already
implemented) is the behavioural contract; tightening types is a
compile-time concern.

- [ ] **Step 1: Update `State.createInvite` signature**

  In `src/client/state.ts`:

  ```ts
  // before
  State.createInvite = async function (
      state:AppState,
      deviceName?:string,
  ):Promise<DeviceInvitation | undefined> {

  // after
  State.createInvite = async function (
      state:AppState,
      deviceName:string,
  ):Promise<DeviceInvitation | undefined> {
  ```

- [ ] **Step 2: Update the call site in `profile.ts`**

  In `src/client/routes/profile.ts`, inside `onAddDevice`:

  ```ts
  // before
  const result = await State.createInvite(
      state,
      addDeviceName.value.trim() || undefined,
  )

  // after
  const result = await State.createInvite(
      state,
      addDeviceName.value.trim(),
  )
  ```

  The button is already disabled when `trim() === ''`, so this call
  can never be reached with an empty string.

- [ ] **Step 3: Run full test suite to confirm no regressions**

  ```sh
  npm test
  ```

  Expected: same result as before (3 pre-existing failures only —
  timezone test, two integration auth tests unrelated to this feature).

- [ ] **Step 4: Commit**

  ```sh
  git add src/client/state.ts src/client/routes/profile.ts
  git commit -m "feat: require deviceName in State.createInvite"
  ```

---

## Final Verification

- [ ] Run `npm test` — only the 3 pre-existing failures should appear.
- [ ] Manually visit `/profile` as a passkey user and confirm:
  - "Add device" button is disabled on load.
  - Typing only spaces keeps the button disabled.
  - Typing a real name enables the button.
  - Submitting creates the invitation with the name shown.
  - After submission, the field clears and the button disables again.
