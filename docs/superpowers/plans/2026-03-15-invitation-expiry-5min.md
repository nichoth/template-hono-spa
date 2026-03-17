# Invitation Expiry 5-Minute TTL Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development
> (if subagents available) or superpowers:executing-plans to implement this plan.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the device invitation TTL from 15 minutes to 5 minutes.

**Architecture:** One constant change in `src/server/auth/index.ts`. No
schema changes, no new functions, no client changes needed — the
`expiresAt` timestamp is already propagated correctly through the
response and displayed by the UI.

**Tech Stack:** TypeScript, Hono, Cloudflare Workers

---

## Chunk 1: Change the TTL constant

### Task 1: Update `DEVICE_INVITATION_TTL_MS`

**Files:**
- Modify: `src/server/auth/index.ts:57`

- [ ] **Step 1: Confirm current value**

  ```sh
  grep -n DEVICE_INVITATION_TTL src/server/auth/index.ts
  ```

  Expected output:
  ```
  57:export const DEVICE_INVITATION_TTL_MS = 15 * 60 * 1000
  ```

- [ ] **Step 2: Change the constant to 5 minutes**

  In `src/server/auth/index.ts`, line 57, replace:

  ```ts
  export const DEVICE_INVITATION_TTL_MS = 15 * 60 * 1000
  ```

  with:

  ```ts
  export const DEVICE_INVITATION_TTL_MS = 5 * 60 * 1000
  ```

- [ ] **Step 3: Run the full test suite**

  ```sh
  npm test 2>&1 | tail -5
  ```

  Expected: `Tests: 0 failed | N passed`

- [ ] **Step 4: Commit**

  ```sh
  git add src/server/auth/index.ts
  git commit -m "fix: set device invitation TTL to 5 minutes"
  ```
