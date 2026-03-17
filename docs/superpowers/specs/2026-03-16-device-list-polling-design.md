# Design: Device List Polling After Invite Creation

**Date**: 2026-03-16
**Status**: Approved

## Problem

When a user creates a device invitation and another device claims it,
the profile page device list does not update until the user manually
reloads the page. The user has no feedback that the new device was
successfully added.

## Goal

After `State.createInvite` succeeds, automatically poll the device
list in the background until a new device appears. Stop polling when
a new device is detected or when no pending invitations remain
(e.g. the invitation was cancelled).

## Scope

Client-side only. No server changes required.
No `useEffect` or component lifecycle involved.

## Design

### Where polling lives

Polling is initiated inside `State.createInvite` in
`src/client/state.ts`, immediately after the invitation POST
succeeds. It runs in the background — `createInvite` returns the
invitation result and the polling continues independently.

A module-level variable holds the active interval reference so it
can be cleared from `createInvite` (on a second invite creation),
from `cancelInvite`, or from within the poll tick itself when a
stop condition is met.

### Baseline

Before starting the interval, capture the set of current device IDs
from `state.devices.value.data`. This is the baseline for detecting
new devices.

### Poll tick (every 5 seconds)

1. Skip if `state.devices.value.pending` (in-flight guard)
2. Call `State.listDevices(state)` and `State.listInvites(state)`
   - Both are called every tick so `state.invitations` stays fresh.
     This is what allows the "no invitations remain" stop condition to
     fire even when the user abandons the flow without explicitly
     cancelling (e.g. after the 5-minute server-side TTL expires the
     next `listInvites` response will return an empty list).
   - Errors inside the tick are swallowed silently by `setInterval`'s
     async callback — this is acceptable; the next tick retries.
3. Check stop conditions:
   - **New device detected**: any device ID in the updated list is
     absent from the baseline set → clear interval
   - **No invitations remain**: `state.invitations.value.data` is
     empty → clear interval

### `cancelInvite` integration

`State.cancelInvite` already calls `State.listInvites(state)`, which
updates `state.invitations`. On the next poll tick, the "no
invitations remain" check will catch this and clear the interval.
No changes to `cancelInvite` are required.

### Lifecycle

```
createInvite called
  → POST /api/auth/passkey/devices/invite
  → listInvites (refresh invitation list)
  → capture baseline device IDs from state.devices.value.data
  → clear any existing poll interval (idempotent)
  → start interval (every 5s)
  → return invitation result

Interval tick
  → skip if state.devices.value.pending
  → listDevices
  → if new device ID found: clear interval
  → if no invitations remain: clear interval

cancelInvite called (separately, by user)
  → DELETE invite
  → listInvites (invitations drop to 0)
  → next tick: no invitations remain → clear interval
```

### Implementation

```typescript
// module-level, outside State.*
const DEVICE_POLL_INTERVAL_MS = 5_000
let devicePollInterval:ReturnType<typeof setInterval> | null = null

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

        // Capture the current device IDs as a baseline.
        // If state.devices has never been loaded, baselineIds will
        // be empty — the first tick will then see all returned
        // devices as "new" and immediately clear the interval after
        // one refresh, which is acceptable.
        const baselineIds = new Set(
            (state.devices.value.data ?? []).map(d => d.deviceId)
        )

        // Clear any prior poll (e.g. user created a second invite)
        if (devicePollInterval !== null) {
            clearInterval(devicePollInterval)
        }

        devicePollInterval = setInterval(async () => {
            if (state.devices.value.pending) return
            await State.listDevices(state)
            await State.listInvites(state)

            const newDevice = (state.devices.value.data ?? [])
                .some(d => !baselineIds.has(d.deviceId))
            const noInvites = (state.invitations.value.data ?? [])
                .length === 0

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

## What This Does Not Include

- No `useEffect` or component lifecycle involvement
- No toast or explicit notification message — device list refreshes
  automatically via `state.devices` signal
- No maximum poll duration (invitation TTL is 5 minutes server-side;
  the server will reject any claim on an expired invite, at which
  point `listInvites` will return 0 items and stop the poll)
- No exponential backoff

## Files Changed

| File | Change |
|------|--------|
| `src/client/state.ts` | Add `DEVICE_POLL_INTERVAL_MS` constant, `devicePollInterval` module var, polling logic inside `createInvite` |
