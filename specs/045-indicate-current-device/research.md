# Research: Indicate Current Device

## Finding 1 — Session Does Not Store Device ID

**Decision**: Add `device_id TEXT` (nullable) column to `sessions` table and
populate it during `finishAuthentication`.

**Rationale**: The spec assumes sessions already identify the current device.
They do not: `sessions` has no `device_id` column. The device is resolved
during authentication but not written to the session record. Recording it at
session creation is the smallest, most reliable fix.

**Alternatives considered**:
- `last_used_at` heuristic — unreliable with multiple concurrent sessions.
  Rejected.
- Second cookie for device ID — proliferates cookies, creates sync problems.
  Rejected.
- Timestamp cross-reference — fragile, not exact. Rejected.

## Finding 2 — D1 Migration for a New Column

**Decision**: In `ensureAuthSchema`, after the main `db.batch(...)`, attempt
`ALTER TABLE sessions ADD COLUMN device_id TEXT` in a try/catch. Silently
ignore the "duplicate column name" error (idempotent).

**Rationale**: SQLite has no `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. A
`PRAGMA table_info` check adds an async round-trip. The `CREATE TABLE` DDL is
also updated to include the column so fresh installs don't need the ALTER.

**Alternatives considered**:
- Migrations tracking table — correct for production systems, overkill for a
  template with one extra column. Rejected (YAGNI).
- Drop-and-recreate — destructive. Rejected.

## Finding 3 — @substrate-system/dialog API

**Package**: `@substrate-system/dialog` v0.0.28 — already installed, not yet
used in the project.

**Tag name**: `modal-window`

**Import**:
```ts
import { ModalWindow } from '@substrate-system/dialog'
import '@substrate-system/dialog/css'
```

**Control pattern (Preact signals)**:
- Use a signal `confirmRevokeDeviceId` (`Signal<string | null>`) that holds
  the device ID awaiting confirmation, or `null` when the dialog is closed.
- Bind `active` attribute: `active=${confirmRevokeDeviceId.value !== null}`.
  The component reads `active="true"` / `active="false"` as a string attribute
  so casting to string is needed, or use the `.open()` / `.close()` instance
  methods on a `ref`.

**Preferred approach**: Imperative `.open()` / `.close()` via `useRef`, since
the `active` attribute string coercion is fiddly with htm. Attach `ref` to the
`modal-window` element and call `ref.current.open()` when the current-device
revoke button is clicked, and `ref.current.close()` after confirm or cancel.

**Event handling for confirm/cancel**:
Place explicit Confirm and Cancel buttons inside the dialog content. Their
`onClick` handlers:
- Confirm: call `onRevokeDevice(confirmRevokeDeviceId.value!)`, then
  `dialogRef.current?.close()`
- Cancel: `dialogRef.current?.close()`

No need to listen to the `modal-window:close` event for the confirm flow.

**Accessibility**: The component automatically sets `role="dialog"`,
`aria-modal="true"`, traps focus, handles Escape. Include an `<h2>` heading
inside the dialog for the automatic `aria-label`.

## Finding 4 — Revoke Flow Gating

**Decision**: Only show the dialog when the device being revoked is the current
device. All other revokes proceed directly as before.

**Implementation**: In the Revoke button `onClick`, check
`device.deviceId === currentDeviceId`. If true, open the dialog; if false,
call `onRevokeDevice` immediately.

`currentDeviceId` is read from `state.user.value.data?.currentDeviceId` (once
the session carries the field, per Finding 1).
