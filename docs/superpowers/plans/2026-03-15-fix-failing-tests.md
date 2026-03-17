# Fix Failing Tests Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development
> (if subagents available) or superpowers:executing-plans to implement this plan.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 4 pre-existing test failures without changing
production behaviour.

**Architecture:** Each failure has an independent root cause. Three are
test bugs (wrong deps, nonexistent API, missing mocks); one is a
timezone bug in production utility code. Fix them in order: simplest
first.

**Tech Stack:** TypeScript, Vitest, Cloudflare Workers test harness
(`@cloudflare/vitest-pool-workers`), Preact signals

---

## Root Cause Summary

| Test | Error | Root Cause |
|------|-------|------------|
| `session-expiration.test.ts` | `8:21am` ≠ `3:21pm` | `formatFriendlyDate` uses local-timezone `Date` methods; must use UTC |
| `unit.spec.ts` | `document is not defined` | `profile.ts` imports `@substrate-system/input` and `@substrate-system/copy-button` which call `document` at module load; test never mocked them |
| `integration.spec.ts` — listDevices | `deps.createID is not a function` | `createAuthService({...})` receives partial deps without `createID`, `now`, `generateAuthenticationOptions`, `verifyAuthenticationResponse` |
| `integration.spec.ts` — allows revoking | `startDeviceRegistration is not a function` | Test calls `authService.startDeviceRegistration` / `finishDeviceRegistration` which don't exist; correct API is `createDeviceInvitation` + `startInviteClaim` + `finishInviteClaim` |

---

## File Map

| File | Change |
|------|--------|
| `src/client/utils/session-expiration.ts` | Use UTC date methods in `formatFriendlyDate` |
| `test/unit.spec.ts` | Add `vi.mock` for `@substrate-system/input` and `@substrate-system/copy-button` |
| `test/integration.spec.ts` | Add missing deps to listDevices test; rewrite allows-revoking test to use invite-claim flow |

---

## Chunk 1: session-expiration timezone fix

### Task 1: Use UTC in `formatFriendlyDate`

**Files:**
- Modify: `src/client/utils/session-expiration.ts:7-17`

- [ ] **Step 1: Run the failing test to confirm the error**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A4 "formats a valid ISO"
  ```

  Expected: FAIL — `8:21am` received, `3:21pm` expected.

- [ ] **Step 2: Fix `formatFriendlyDate` to use UTC methods**

  Replace the body of `formatFriendlyDate` in
  `src/client/utils/session-expiration.ts`:

  ```ts
  function formatFriendlyDate (date: Date): string {
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const rawHour = date.getUTCHours()
      const hour = rawHour % 12 === 0 ? 12 : rawHour % 12
      const minute = String(date.getUTCMinutes()).padStart(2, '0')
      const period = rawHour >= 12 ? 'pm' : 'am'

      return `${year}-${month}-${day}, ${hour}:${minute}${period}`
  }
  ```

- [ ] **Step 3: Run the test again to confirm it passes**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A4 "formats a valid ISO"
  ```

  Expected: PASS.

- [ ] **Step 4: Commit**

  ```sh
  git add src/client/utils/session-expiration.ts
  git commit -m "fix: use UTC methods in formatFriendlyDate"
  ```

---

## Chunk 2: unit.spec.ts — missing web component mocks

### Task 2: Mock `@substrate-system/input` and `@substrate-system/copy-button`

**Files:**
- Modify: `test/unit.spec.ts:46-58` (after the existing `vi.mock` calls)

The `routes/index.js` import chain reaches `profile.ts` →
`@substrate-system/input` and `@substrate-system/copy-button`. Both
call `document` at module load time. The test already mocks
`@substrate-system/button` and `@substrate-system/radio-input` for
the same reason.

- [ ] **Step 1: Run the failing test suite to confirm the error**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -B2 "document is not defined"
  ```

  Expected: `FAIL test/unit.spec.ts` with `ReferenceError: document
  is not defined`.

- [ ] **Step 2: Add the two missing mocks to `test/unit.spec.ts`**

  Insert after the existing `vi.mock('@substrate-system/radio-input',
  ...)` block (around line 58):

  ```ts
  vi.mock('@substrate-system/input', () => ({
      SubstrateInput: {
          TAG: 'substrate-input',
          define: () => {},
      },
  }))

  vi.mock('@substrate-system/copy-button', () => ({
      CopyButton: {
          TAG: 'copy-button',
          define: () => {},
      },
  }))
  ```

- [ ] **Step 3: Run unit.spec.ts to confirm no more `document` error**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -E "unit.spec|document is not"
  ```

  Expected: `test/unit.spec.ts` passes; no `document is not defined`
  error.

- [ ] **Step 4: Commit**

  ```sh
  git add test/unit.spec.ts
  git commit -m "fix: mock substrate-system/input and copy-button in unit tests"
  ```

---

## Chunk 3: integration tests — fix two Device revocation tests

### Task 3a: Add missing deps to the `listDevices` test

**Files:**
- Modify: `test/integration.spec.ts:1185-1249`

The `createAuthService({...})` call at line 1185 passes a partial
deps object. Missing: `createID`, `now`, `generateAuthenticationOptions`,
`verifyAuthenticationResponse`. These are needed by `startRegistration`,
`finishRegistration`, `confirmEmail`, `createDeviceInvitation`,
`startInviteClaim`, and `finishInviteClaim`.

- [ ] **Step 1: Run the failing test to confirm the error**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A4 "listDevices returns"
  ```

  Expected: FAIL — `deps.createID is not a function`.

- [ ] **Step 2: Add the 4 missing deps**

  In `test/integration.spec.ts`, find the `createAuthService({`
  call inside the `'listDevices returns only active devices'` test
  (around line 1185). Add the four missing fields to the deps object,
  after the `verifyRegistrationResponse` mock:

  ```ts
  generateAuthenticationOptions:
      async () => ({
          challenge: '',
          rpId: '',
      }),
  verifyAuthenticationResponse:
      async () => ({
          verified: true,
          authenticationInfo: {} as never,
      }),
  now: () => Date.now(),
  createID: () => crypto.randomUUID(),
  ```

- [ ] **Step 3: Run the test to confirm it passes**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A4 "listDevices returns"
  ```

  Expected: PASS.

### Task 3b: Replace `startDeviceRegistration` with invite-claim flow

**Files:**
- Modify: `test/integration.spec.ts:1101-1132`

The test calls `authService.startDeviceRegistration()` and
`authService.finishDeviceRegistration()` which don't exist. The
auth service adds a second device via the invite-claim flow:
`createDeviceInvitation` → `startInviteClaim` → `finishInviteClaim`.

The `listDevices` test (same file, a few lines later) already uses
this pattern correctly — use it as a reference.

- [ ] **Step 1: Run the failing test to confirm the error**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A4 "allows revoking"
  ```

  Expected: FAIL — `authService.startDeviceRegistration is not a
  function`.

- [ ] **Step 2: Replace the two nonexistent calls**

  In `test/integration.spec.ts`, replace the block from
  `const devStart = await authService.startDeviceRegistration(...)`
  through the closing `})` of `finishDeviceRegistration` (lines
  ~1101–1132) with the invite-claim pattern:

  ```ts
  const inv =
      await authService.createDeviceInvitation(
          db,
          'http://localhost/add',
          user!.id,
          'Second Device',
      )

  const claimStart =
      await authService.startInviteClaim(
          db,
          'http://localhost/add',
          inv.inviteCode,
      )

  await authService.finishInviteClaim(
      db,
      'http://localhost/add',
      inv.inviteCode,
      {
          challengeReference:
              claimStart.challengeReference,
          credential: {} as never,
      },
  )
  ```

- [ ] **Step 3: Run the test to confirm it passes**

  ```sh
  npm test -- --reporter=verbose 2>&1 | grep -A4 "allows revoking"
  ```

  Expected: PASS.

- [ ] **Step 4: Run the full suite — confirm only 0 new failures**

  ```sh
  npm test 2>&1 | tail -5
  ```

  Expected: `Tests: 0 failed | N passed`.

- [ ] **Step 5: Commit**

  ```sh
  git add test/integration.spec.ts
  git commit -m "fix: repair device revocation integration tests"
  ```
