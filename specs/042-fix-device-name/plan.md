# Implementation Plan: Fix Device Name Bug

**Branch**: `042-fix-device-name` | **Date**: 2026-03-15
**Spec**: [spec.md](spec.md)

## Summary

The "Add device" form in the profile page discards the user-entered device
name because the `SubstrateInput` component is missing an `onInput` event
handler to update the `addDeviceName` signal. The fix is a one-line addition
to `src/client/routes/profile.ts` plus two new integration tests.

## Technical Context

**Language/Version**: TypeScript (ES2022 target)
**Primary Dependencies**: Preact + Signals (frontend), Hono (server)
**Storage**: Cloudflare D1 (SQLite) — no schema changes needed
**Testing**: Vitest (`npm test`)
**Target Platform**: Cloudflare Workers + browser SPA
**Project Type**: Web application (SPA + API server)
**Performance Goals**: Standard web app expectations
**Constraints**: No server-side changes; frontend-only fix

## Constitution Check

No project constitution has been defined. Applying general software
engineering principles:

- [x] Fix is minimal and targeted — single missing event handler
- [x] Tests required per spec (FR-004, FR-005)
- [x] No API surface changes

## Project Structure

### Documentation (this feature)

```text
specs/042-fix-device-name/
├── plan.md              # This file
├── research.md          # Phase 0 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (affected files only)

```text
src/
└── client/
    └── routes/
        └── profile.ts   # Add onInput handler to SubstrateInput

test/
└── integration.spec.ts  # Add named/unnamed invitation tests
```

**Structure Decision**: Single project, minimal change — no new files needed.
No data model changes, no contracts changes, no new API endpoints.

## Phase 0: Research (complete)

See [research.md](research.md).

**Root cause**: Missing `onInput` handler on `SubstrateInput` at
`src/client/routes/profile.ts:346-351`.

**Fix**: Add `onInput=${(event:InputEvent) => { addDeviceName.value =
(event.target as HTMLInputElement).value }}` to the `SubstrateInput`.

## Phase 1: Design

### Data Model

No data model changes. The `device_invitations` table already has a
`device_name` column. The `DeviceInvitation` client type already has a
`deviceName` field. No migrations needed.

### Contracts

No API contract changes. The `POST /api/auth/passkey/devices/invite` endpoint
already accepts `{ deviceName?: string }` and the server already passes it
through correctly.

### Implementation Steps

**Step 1 — Fix the form** (`src/client/routes/profile.ts`):

Add `onInput` handler to the `SubstrateInput` so the signal is updated on
each keystroke:

```typescript
<${SubstrateInput.TAG}
    name="device-name"
    id="device-name"
    placeholder="My work laptop"
    value=${addDeviceName.value}
    onInput=${(event:InputEvent) => {
        addDeviceName.value =
            (event.target as HTMLInputElement).value
    }}
><//>`
```

**Step 2 — Add tests** (`test/integration.spec.ts`):

Two test cases to add alongside existing device invitation tests:

1. **Named invitation test**: Call `createDeviceInvitation(..., 'My Laptop')`,
   assert returned invitation has `deviceName === 'My Laptop'`. Also assert
   `listDeviceInvitations()` returns the invitation with the correct name.

2. **Unnamed invitation test**: Call `createDeviceInvitation(...)` without a
   device name, assert `deviceName` is `null`/`undefined`.

These tests exercise the existing server-side path (which is already
correct) to act as regression guards and fulfill FR-004/FR-005.
