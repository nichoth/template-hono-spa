# Implementation Plan: Show Revoked Devices in Profile

**Branch**: `050-show-revoked-devices` | **Date**: 2026-03-17
**Spec**: [spec.md](./spec.md)

## Summary

Currently the profile page only shows active (non-revoked) devices. This
change makes all devices visible — revoked ones are displayed at 0.4 opacity
with a "Revoked" label and no action button. No database schema changes are
needed; revoked devices are already stored with `is_revoked = 1`. The change
touches three files: one server function, one client view, and one stylesheet.

## Technical Context

**Language/Version**: TypeScript (ES2022), ESM
**Primary Dependencies**: Preact + `@preact/signals`, htm/preact (client);
Hono + Cloudflare Workers D1 (server)
**Storage**: Cloudflare D1 (SQLite) — no schema changes required
**Testing**: `npm test`
**Target Platform**: Cloudflare Workers + browser SPA
**Project Type**: Web application (SPA + serverless backend)
**Performance Goals**: No new queries; existing `listDevicesByUserId` used
**Constraints**: No new npm dependencies

## Constitution Check

Constitution file is a placeholder template — no project-specific gates
defined. Following project AGENTS.md guidelines:
- Write as little code as possible
- Use `@preact/signals` for all client-side state
- Do not add new dependencies

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/050-show-revoked-devices/
├── plan.md           # This file
├── research.md       # Phase 0 output
├── data-model.md     # Phase 1 output
└── tasks.md          # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/
├── server/
│   └── auth/
│       └── index.ts       # Change: listRegisteredDevices query
└── client/
    └── routes/
        ├── profile.ts     # Change: render revoked devices in list
        └── profile.css    # Change: add revoked device opacity style
```

## Implementation Tasks

### Task 1 — Server: expose all devices via API

**File**: `src/server/auth/index.ts`
**Change**: In `listRegisteredDevices`, replace `listActiveDevicesByUserId`
with `listDevicesByUserId`.

```ts
// Before
async function listRegisteredDevices(db, userID) {
    await ensureAuthSchema(db)
    return listActiveDevicesByUserId(db, userID)
}

// After
async function listRegisteredDevices(db, userID) {
    await ensureAuthSchema(db)
    return listDevicesByUserId(db, userID)
}
```

Also update the import: add `listDevicesByUserId` (it is already exported
from `db/index.ts`).

**Note**: `listDevicesByUserId` orders by `last_used_at DESC, created_at ASC`,
so active most-recently-used devices appear first naturally.

---

### Task 2 — Client: render revoked devices in the list

**File**: `src/client/routes/profile.ts`

1. Remove the `activeDevices` computed signal that filters `isRevoked`.
   Replace usages with the full `state.devices.value.data ?? []`.

2. Update `canRevoke` to continue filtering only active devices for the
   count check (behavior unchanged).

3. In the device list render: for each device, conditionally:
   - Add CSS class `device-item--revoked` when `device.isRevoked` is true
   - Show a `<span class="device-revoked-label">Revoked</span>` badge
   - Omit the "Revoke" button entirely for revoked devices

---

### Task 3 — CSS: style for revoked devices

**File**: `src/client/routes/profile.css`

Add:

```css
.device-item--revoked {
    opacity: 0.4;
}

.device-revoked-label {
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
```

---

## Ordering

Tasks must be done in order: Task 1 (server) → Task 2 (client) → Task 3
(CSS). Task 2 depends on Task 1 returning revoked devices. Task 3 is
the styling companion to Task 2.
