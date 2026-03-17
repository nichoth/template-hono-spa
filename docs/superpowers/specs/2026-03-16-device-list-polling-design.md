# Design: Device List Polling on Profile Page

**Date**: 2026-03-16
**Status**: Approved

## Problem

When a user creates a device invitation and another device claims it,
the profile page device list does not update until the user manually
reloads the page. The user has no feedback that the new device was
successfully added.

## Goal

Automatically refresh the device list while the user is on the profile
page and has at least one pending invitation. Stop polling when no
invitations remain (because the invite was claimed or cancelled).

## Scope

Client-side only. No server changes required.

## Design

### Trigger Condition

Polling is active when both of the following are true:
1. The `ProfileRoute` component is mounted (user is on `/profile`)
2. At least one pending invitation exists
   (`pendingInvitations.value.length > 0`)

### Polling Behaviour

- Interval: 5 seconds (`DEVICE_POLL_INTERVAL_MS = 5_000`)
- Each tick calls `State.listDevices(state)` and
  `State.listInvites(state)`
- `listDevices` causes the new device to appear in the UI
- `listInvites` causes `pendingInvitations` to update, which stops
  the poll once the invite is consumed

### Lifecycle

```
Component mounts
  → existing mount useEffect: listDevices + listInvites (unconditional,
    runs once when isPasskeyUser becomes true)
  → new polling useEffect: if pendingInvitations > 0, start interval
    (exits immediately if no pending invitations)

Interval tick (every 5s)
  → skip if state.devices.value.pending (in-flight guard)
  → listDevices  (device list refreshes in UI)
  → listInvites  (invitation count may drop to 0)

pendingInvitations drops to 0
  → component re-renders (Preact signal change)
  → polling useEffect re-runs with new deps, clears interval

Component unmounts
  → cleanup clears interval
```

### Implementation

One constant and one `useEffect` added to
`src/client/routes/profile.ts`:

```typescript
const DEVICE_POLL_INTERVAL_MS = 5_000

useEffect(() => {
    if (!pendingInvitations.value.length) return
    const id = setInterval(() => {
        if (state.devices.value.pending) return
        State.listDevices(state)
        State.listInvites(state)
    }, DEVICE_POLL_INTERVAL_MS)
    return () => clearInterval(id)
}, [pendingInvitations.value.length > 0])
```

**Signal dependency note**: `pendingInvitations` is a `useComputed`
signal already consumed in the render body. Because Preact re-renders
the component whenever a signal read during render changes, the effect
re-runs with an updated deps array whenever `pendingInvitations.value`
changes. This is standard Preact signal + `useEffect` interaction —
not a raw signal subscription.

**In-flight guard**: Each tick checks `state.devices.value.pending`
before firing. If the previous request is still in flight (e.g. on a
slow connection), the tick is skipped. Last-write-wins is acceptable
for these idempotent GET endpoints; the guard prevents double-updates
to the same signal within a single interval cycle.

## What This Does Not Include

- No toast or explicit notification message
- No server-sent events or WebSocket infrastructure
- No exponential backoff or jitter (not needed at 5s for this use
  case)
- No polling when there are no pending invitations (avoids
  unnecessary load)

## Files Changed

| File | Change |
|------|--------|
| `src/client/routes/profile.ts` | Add `DEVICE_POLL_INTERVAL_MS` constant and one `useEffect` |

## Trade-offs

| Concern | Decision |
|---------|----------|
| Latency | Up to 5s delay before new device appears — acceptable |
| Server load | One extra D1 read per 5s per active user with a pending invite — negligible |
| Complexity | Minimal — reuses existing `State.listDevices` and `State.listInvites` |
| Cloudflare Workers compatibility | Full — no streaming, no Durable Objects |
