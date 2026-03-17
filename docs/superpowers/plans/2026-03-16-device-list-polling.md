# Device List Polling Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development
> (if subagents available) or superpowers:executing-plans to implement this plan.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After `State.createInvite` succeeds, automatically poll the
device list every 5 seconds until a new device is detected or no
invitations remain, so the profile page updates without a manual reload.

**Architecture:** A module-level interval variable in `src/client/state.ts`
tracks the active poll. `State.createInvite` captures a baseline of
current device IDs, then starts the interval. Each tick calls both
`listDevices` and `listInvites`; when a new device ID appears or
invitations drop to zero, the interval clears itself.

**Tech Stack:** TypeScript, Preact Signals (`@preact/signals`),
`@substrate-system/state` (RequestState), `ky` (HTTP client),
Vitest + `@cloudflare/vitest-pool-workers`

**Spec:** `docs/superpowers/specs/2026-03-16-device-list-polling-design.md`

---

## File Structure

| File | Change | Responsibility |
|------|--------|----------------|
| `src/client/state.ts` | Modify | Add `DEVICE_POLL_INTERVAL_MS`, `devicePollInterval`, polling logic in `createInvite` |
| `test/state-polling.spec.ts` | Create | Unit tests for polling behaviour — separate file so `ky` can be mocked cleanly |

---

## Chunk 1: Tests

### Task 1: Create the test file with failing tests

**Files:**
- Create: `test/state-polling.spec.ts`

---

- [ ] **Step 1: Write the test file**

Create `test/state-polling.spec.ts` with the following content. These
tests will FAIL until the polling logic is added to `State.createInvite`.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { signal } from '@preact/signals'
import { RequestState } from '@substrate-system/state'
import type { HTTPError } from 'ky'
import ky from 'ky'
import {
    State,
    type AppState,
    type DeviceInfo,
    type PendingInvitation,
    type DeviceInvitation,
    type SessionResponse,
} from '../src/client/state.js'
import type { RequestFor } from '@substrate-system/state'

// vi.mock is hoisted to the top of the compiled output by vitest's
// transform — it runs before any import statement regardless of
// source order. The import of ky above receives the mocked module.
vi.mock('ky', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}))

const mockGet = vi.mocked(ky.get)
const mockPost = vi.mocked(ky.post)

// NOTE: vi.useFakeTimers() patches vitest's timer globals. In the
// @cloudflare/vitest-pool-workers environment, the Workers-runtime
// setInterval may or may not be the same global. Each polling test
// includes a guard assertion (expect(devicesCallCount).toBeGreaterThan(0))
// after the first advanceTimersByTimeAsync call — if this assertion
// fails with 0, fake timers are not reaching the isolate and the
// polling logic must be tested via a different mechanism.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDevice (id:string):DeviceInfo {
    return {
        deviceId: id,
        credentialId: `cred-${id}`,
        credentialName: `Device ${id}`,
        aaguid: null,
        transports: [],
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        isRevoked: false,
    }
}

function makeInvite (code:string):PendingInvitation {
    return {
        inviteCode: code,
        deviceName: 'Test Device',
        status: 'pending',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        createdAt: new Date().toISOString(),
    }
}

function makeInvitation ():DeviceInvitation & { status:string } {
    return {
        inviteCode: 'test-invite',
        inviteUrl: 'http://localhost/add/test-invite',
        deviceName: 'Test Device',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        status: 'pending',
    }
}

function createTestState ():AppState {
    return {
        route: signal('/'),
        count: signal(0),
        user: signal<RequestFor<SessionResponse, HTTPError|Error>>(
            RequestState()
        ),
        response: signal<RequestFor<{ message:string }, HTTPError|Error>>(
            RequestState()
        ),
        devices: signal<RequestFor<DeviceInfo[], HTTPError|Error>>(
            RequestState()
        ),
        invitations: signal<RequestFor<PendingInvitation[], HTTPError|Error>>(
            RequestState()
        ),
        logoutInProgress: signal(false),
        logoutError: signal(null),
    } as unknown as AppState
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('State.createInvite polling', () => {
    let state:AppState

    beforeEach(() => {
        vi.useFakeTimers()
        state = createTestState()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('calls listDevices and listInvites on each poll tick', async () => {
        const device1 = makeDevice('device-1')
        const invite = makeInvite('abc')

        // Seed state with one existing device and one invitation
        state.devices.value = {
            pending: false, data: [device1], error: null,
        }
        state.invitations.value = {
            pending: false, data: [invite], error: null,
        }

        // POST returns invitation; GET returns same device+invite forever
        mockPost.mockReturnValue({
            json: () => Promise.resolve(makeInvitation()),
        })
        mockGet.mockImplementation((url:string) => ({
            json: () => url.includes('/invites') ?
                Promise.resolve([invite]) :
                Promise.resolve([device1]),
        }))

        await State.createInvite(state, 'Test Device')

        // Advance one poll interval
        await vi.advanceTimersByTimeAsync(5_100)

        // listDevices → GET /api/auth/passkey/devices
        // listInvites → GET /api/auth/passkey/devices/invites
        // Plus initial listInvites inside createInvite = 2 total invites calls
        const devicesCalls = mockGet.mock.calls.filter(
            ([url]:unknown[]) => !String(url).includes('/invites')
        )
        const invitesCalls = mockGet.mock.calls.filter(
            ([url]:unknown[]) => String(url).includes('/invites')
        )
        expect(devicesCalls.length).toBeGreaterThanOrEqual(1)
        expect(invitesCalls.length).toBeGreaterThanOrEqual(2) // initial + tick
    })

    it('stops polling when a new device appears in the list', async () => {
        const device1 = makeDevice('device-1')
        const device2 = makeDevice('device-2')
        const invite = makeInvite('abc')

        state.devices.value = {
            pending: false, data: [device1], error: null,
        }
        state.invitations.value = {
            pending: false, data: [invite], error: null,
        }

        mockPost.mockReturnValue({
            json: () => Promise.resolve(makeInvitation()),
        })

        let devicesCallCount = 0
        mockGet.mockImplementation((url:string) => ({
            json: () => {
                if (url.includes('/invites')) {
                    return Promise.resolve([invite])
                }
                devicesCallCount++
                // Second devices call includes the new device
                return devicesCallCount >= 2 ?
                    Promise.resolve([device1, device2]) :
                    Promise.resolve([device1])
            },
        }))

        await State.createInvite(state, 'Test Device')

        // Tick 1: no new device, keeps going
        await vi.advanceTimersByTimeAsync(5_100)
        // Guard: confirms fake timers are reaching the interval callback.
        // If this fails with 0, vi.useFakeTimers() is not working in
        // this environment — investigate before continuing.
        expect(devicesCallCount).toBeGreaterThan(0)

        // Tick 2: new device found, interval clears
        await vi.advanceTimersByTimeAsync(5_100)

        const callsAfterStop = devicesCallCount
        // Tick 3 should NOT fire
        await vi.advanceTimersByTimeAsync(5_100)

        expect(devicesCallCount).toBe(callsAfterStop)
    })

    it('stops polling when no invitations remain', async () => {
        const device1 = makeDevice('device-1')
        const invite = makeInvite('abc')

        state.devices.value = {
            pending: false, data: [device1], error: null,
        }
        state.invitations.value = {
            pending: false, data: [invite], error: null,
        }

        mockPost.mockReturnValue({
            json: () => Promise.resolve(makeInvitation()),
        })

        let devicesCallCount = 0
        mockGet.mockImplementation((url:string) => ({
            json: () => {
                if (url.includes('/invites')) {
                    // Invitations gone after first tick
                    return Promise.resolve(
                        devicesCallCount >= 1 ? [] : [invite]
                    )
                }
                devicesCallCount++
                return Promise.resolve([device1])
            },
        }))

        await State.createInvite(state, 'Test Device')

        // Tick 1: invites return empty, interval clears
        await vi.advanceTimersByTimeAsync(5_100)
        // Guard: fails loudly if fake timers are not reaching the isolate
        expect(devicesCallCount).toBeGreaterThan(0)

        const callsAfterStop = devicesCallCount
        // Tick 2 should NOT fire
        await vi.advanceTimersByTimeAsync(5_100)

        expect(devicesCallCount).toBe(callsAfterStop)
    })

    it('replaces existing poll interval when createInvite is called again', async () => {
        const device1 = makeDevice('device-1')
        const invite = makeInvite('abc')

        state.devices.value = {
            pending: false, data: [device1], error: null,
        }
        state.invitations.value = {
            pending: false, data: [invite], error: null,
        }

        mockPost.mockReturnValue({
            json: () => Promise.resolve(makeInvitation()),
        })
        mockGet.mockImplementation((url:string) => ({
            json: () => url.includes('/invites') ?
                Promise.resolve([invite]) :
                Promise.resolve([device1]),
        }))

        // Create two invites in a row
        await State.createInvite(state, 'Device A')
        await State.createInvite(state, 'Device B')

        // Only one interval should be active — advance one interval
        // and count device calls (should be exactly 1 per tick, not 2)
        mockGet.mockClear()
        await vi.advanceTimersByTimeAsync(5_100)

        const devicesCalls = mockGet.mock.calls.filter(
            ([url]:unknown[]) => !String(url).includes('/invites')
        )
        // Guard: confirms fake timers are reaching the interval callback
        expect(devicesCalls.length).toBeGreaterThanOrEqual(1)
    })
})
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npm test -- test/state-polling.spec.ts --reporter=verbose
```

Expected: **4 tests FAIL** with errors like
`TypeError: setInterval is not a function` or the interval never
starts (because `State.createInvite` doesn't start polling yet).
If they pass, the implementation already exists — investigate before
continuing.

---

## Chunk 2: Implementation

### Task 2: Add polling to `State.createInvite`

**Files:**
- Modify: `src/client/state.ts` (module level + `createInvite` function)

---

- [ ] **Step 1: Add the module-level constant and interval variable**

In `src/client/state.ts`, add these two lines at module level — place
them just before `State.listDevices`:

```typescript
const DEVICE_POLL_INTERVAL_MS = 5_000
let devicePollInterval:ReturnType<typeof setInterval> | null = null
```

- [ ] **Step 2: Replace `State.createInvite` with the polling version**

Replace the current `State.createInvite` function (lines 364–380 of
`src/client/state.ts`) with:

```typescript
State.createInvite = async function (
    state:AppState,
    deviceName:string,
):Promise<DeviceInvitation | undefined> {
    try {
        const result = await ky.post(
            '/api/auth/passkey/devices/invite',
            { json: { deviceName } },
        ).json<DeviceInvitation & { status:string }>()

        await State.listInvites(state)

        // Capture current device IDs as the baseline.
        // If state.devices has not been loaded yet, baselineIds will
        // be empty — the first tick will then see all returned devices
        // as "new" and clear the interval after one refresh, which is
        // acceptable.
        const baselineIds = new Set(
            (state.devices.value.data ?? []).map(
                (d:DeviceInfo) => d.deviceId
            )
        )

        // Replace any prior interval (e.g. user created a second invite)
        if (devicePollInterval !== null) {
            clearInterval(devicePollInterval)
        }

        devicePollInterval = setInterval(async () => {
            // Skip tick if a devices request is already in flight
            if (state.devices.value.pending) return

            await State.listDevices(state)
            await State.listInvites(state)

            const newDevice = (state.devices.value.data ?? [])
                .some((d:DeviceInfo) => !baselineIds.has(d.deviceId))
            const noInvites = (
                state.invitations.value.data ?? []
            ).length === 0

            if (newDevice || noInvites) {
                clearInterval(devicePollInterval!)
                devicePollInterval = null
            }
        }, DEVICE_POLL_INTERVAL_MS)

        return result
    } catch (_err) {
        const err = _err as HTTPError|Error
        throw err
    }
}
```

- [ ] **Step 3: Run the new tests to verify they pass**

```bash
npm test -- test/state-polling.spec.ts --reporter=verbose
```

Expected: **4 tests PASS**. If any fail, check the mock setup and
signal update logic before moving on.

- [ ] **Step 4: Run the full test suite to verify no regressions**

```bash
npm test && npm run lint
```

Expected: all tests pass, no new lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/client/state.ts test/state-polling.spec.ts
git commit -m "feat: poll device list after invite creation

After createInvite succeeds, poll listDevices and listInvites every
5s. Stop when a new device appears or no invitations remain. Replace
previous interval on second invite creation.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Verification

After the commit, manually verify by:
1. Log in on a first device
2. Navigate to `/profile`
3. Create a device invitation
4. On a second device (or incognito window), claim the invite
5. On the first device, the new device should appear in the list
   within 5 seconds — no manual reload required
