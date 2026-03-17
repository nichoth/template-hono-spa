# Implementation Plan: Confirm Revoke Device

**Branch**: `048-confirm-revoke-device` | **Date**: 2026-03-16
**Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/048-confirm-revoke-device/spec.md`

## Summary

Add a confirmation modal before any device revocation. Clicking "Revoke"
in the device list opens a `modal-window` (`@substrate-system/dialog`)
that shows "Remove device <name>?" with a danger-styled "Revoke" button.
The button shows a spinner while the API request is in flight. On success
the modal closes and the device list refreshes; on failure the modal stays
open and shows the error message inline.

## Technical Context

**Language/Version**: TypeScript (ES2022), ESM
**Primary Dependencies**: Preact + @preact/signals, htm/preact,
@substrate-system/dialog (already installed), @substrate-system/button,
Hono (server - no changes needed)
**Storage**: Cloudflare D1 — no schema changes
**Testing**: vitest (integration + unit)
**Target Platform**: Cloudflare Workers SPA
**Project Type**: Web application (SPA + Hono API)
**Performance Goals**: Standard web interaction latency
**Constraints**: No backend changes; frontend-only feature
**Scale/Scope**: Single profile page component

## Constitution Check

The project constitution file is a blank template (no project-specific
rules defined). No gate violations to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/048-confirm-revoke-device/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
└── client/
    └── routes/
        ├── profile.ts   # Only file modified - add modal state + markup
        └── profile.css  # Add danger button style for revoke action
test/
└── integration.spec.ts  # Add/update confirmation-flow test cases
```

**Structure Decision**: Single-project layout. All changes are confined
to the existing profile route component and its stylesheet.

## Research

### @substrate-system/dialog API

- Custom element tag: `modal-window`
- TypeScript class: `ModalWindow` (exported from `@substrate-system/dialog`)
- Open/close via `.open()` / `.close()` methods, or `active` attribute
- Listens for `ModalWindow.event('close')` to detect user-initiated close
- `noclick` attribute prevents backdrop-click dismissal while a request
  is in flight (applied programmatically)
- CSS already imported in `profile.css` via
  `@import url("@substrate-system/dialog/css")`
- Accessible: includes `role="dialog"`, focus trapping, Escape key close,
  and uses first heading (`h2`–`h6`) as `aria-label`

**Decision**: Use `ModalWindow.TAG` constant for the element tag in `htm`
templates (same pattern as `SubstrateButton.TAG` already used in
profile.ts). Control open/close state with a Preact signal and
`useEffect` to call `.open()` / `.close()` imperatively via a `ref`.

### State management approach

The existing pattern uses `useSignal` for local async state
(`revokePending`, `revokeError`). The modal adds two signals:

- `revokeTarget` — `DeviceInfo | null` — the device selected for
  revocation (non-null means the modal should be open)
- `revokeError` — already exists, will be surfaced inside the modal

**Decision**: Repurpose `revokeTarget` signal to drive modal open/close.
Opening: set `revokeTarget` to the device. Closing: set to `null`.
`onRevokeDevice` is called only from inside the modal's confirm button,
not directly from the list.

### Danger button style

The existing `SubstrateButton` component supports a `class` attribute.
A `.danger` CSS class will be applied to the confirm button in the modal,
styled with red/danger colours in `profile.css`.

**Decision**: Add `.dialog-revoke-btn` class with danger styling scoped
inside `.route.profile modal-window`.

## Data Model

No new data entities. Existing `DeviceInfo` type is used to populate the
modal.

**Relevant existing type** (`src/client/state.ts`):
```ts
export interface DeviceInfo {
    deviceId:string;
    credentialName:string | null;
    createdAt:string;
    lastUsedAt:string | null;
    isRevoked:boolean;
}
```

The modal needs only `deviceId` and `credentialName` from this type.

## Interface Contracts

No new API endpoints. The existing endpoint is unchanged:

```
PATCH /api/auth/passkey/devices/:deviceId/revoke
```

Error responses that must be surfaced in the modal:
- `403 self_revoke` — "Cannot revoke the device you are currently using."
- `409 last_device` — "Cannot revoke your only active device."
- Network/other errors — show `err.message`

## Implementation Tasks

### Task 1 — Add modal state signals to profile component

In `src/client/routes/profile.ts`:

1. Import `ModalWindow` from `@substrate-system/dialog`
2. Add signal `revokeTarget = useSignal<DeviceInfo | null>(null)`
3. Add signal `revokeDialogError = useSignal<string | null>(null)`
   (rename from `revokeError` which is currently a component-level error;
   repurpose it to live inside the modal only)
4. Add `revokeDialogRef` with `useRef<ModalWindow | null>(null)`
5. Add `useEffect` to call `.open()` / `.close()` on the ref when
   `revokeTarget` changes

### Task 2 — Refactor revoke button handler

Change the "Revoke" button's `onClick` from calling `onRevokeDevice`
directly to setting `revokeTarget.value = device` (opens the modal).

Remove the `spinning` and `disabled` attributes related to
`revokePending` from the list button (those move to the modal button).

### Task 3 — Add `onRevokeDevice` modal submit handler

Rename the existing `onRevokeDevice` into a modal-submit handler that:

1. Sets `revokePending.value = revokeTarget.value.deviceId`
2. Clears `revokeDialogError`
3. Calls `State.revokeDevice(state, deviceId)`
4. On success: sets `revokeTarget.value = null` (closes modal)
5. On error: sets `revokeDialogError.value = err.message`
6. Finally: clears `revokePending`

### Task 4 — Render the confirmation modal

Add the `modal-window` element to the JSX below the device list.
Content:
- `<h2>` with text "Remove device ${deviceName}?"
- A `<div class="dialog-actions">` (style already exists in profile.css)
  containing:
  - Cancel button (`SubstrateButton`) that sets `revokeTarget.value = null`
  - Revoke button (`SubstrateButton` with `.dialog-revoke-btn` class)
    with `spinning` and `disabled` wired to `revokePending`
- Error paragraph `<p class="device-error">` shown when
  `revokeDialogError.value` is non-null

Modal must have `noclick` while `revokePending.value !== null` to
prevent closing during in-flight request.

### Task 5 — Add danger button CSS

In `src/client/routes/profile.css`, inside `.route.profile`, add:

```css
& .dialog-revoke-btn {
    --substrate-button-bg: var(--color-danger, #c00);
    --substrate-button-bg-hover: var(--color-danger-hover, #a00);
    --substrate-button-color: #fff;
}
```

(Exact CSS variable names may need adjustment based on what
`@substrate-system/button` exposes — verify during implementation.)

### Task 6 — Update integration tests

In `test/integration.spec.ts`, add/update test cases to verify:
- Revoke button click does not call API immediately
- Modal appears with correct device name
- Clicking Cancel closes modal without API call
- Clicking Revoke in modal calls API and closes modal on success
- API error leaves modal open and shows error text

## Quickstart

```bash
# Run dev server
npm run dev

# Navigate to profile page, sign in as passkey user
# Click "Revoke" on a device → confirm modal should appear

# Run tests
npm test && npm run lint
```
