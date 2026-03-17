# Research: Fix Modal Reopen State

## Root Cause Analysis

**Decision**: The bug is caused by `revokeTarget` serving dual
purposes: (1) which device to revoke, and (2) whether the modal is
open. The `useEffect` that calls `modal.open()` tracks
`revokeTarget.value` — when the user clicks "Revoke" on the same
device twice, the signal value is unchanged between clicks, so the
effect does not re-run.

**Rationale**: Signals only trigger effects when their value changes.
Clicking the same device a second time sets `revokeTarget.value` to
the same object reference, which is a no-op to the reactive system.

**Alternatives considered**:
- Reset `revokeTarget` to `null` before re-setting it on each click
  (hacky, two assignments required, fragile).
- Replace `useEffect` with `useSignalEffect` but keep the inferred
  boolean (still doesn't solve the same-device case).
- Introduce a dedicated boolean signal for modal open/close state
  (chosen — clean, single responsibility, directly expresses intent).

---

## `useSignalEffect` vs `useEffect`

**Decision**: Use `useSignalEffect` from `@preact/signals` instead of
`useEffect` from `preact/hooks`.

**Rationale**: `useSignalEffect` runs whenever any signal accessed
inside it changes. It does not require a dependency array — the
reactive subscriptions are tracked automatically. This eliminates the
risk of stale closures and missing dependency array entries.
`useSignalEffect` is confirmed exported from `@preact/signals` in this
project's installed version.

**Alternatives considered**:
- Keep `useEffect` with `[revokeDialogOpen.value]` in deps array:
  works, but `useSignalEffect` is the idiomatic preact-signals approach
  and removes the manual dependency array.

---

## Implementation Design

**New signal**: `revokeDialogOpen = useSignal(false)` — boolean,
controls modal visibility only.

**`useSignalEffect`** replaces the existing `useEffect`:
```ts
useSignalEffect(() => {
    const modal = revokeDialogRef.current
    if (!modal) return
    if (revokeDialogOpen.value) {
        modal.open()
    } else {
        modal.close()
    }
})
```

**Open trigger** (Revoke button click):
```ts
onClick=${() => {
    revokeTarget.value = device
    revokeDialogOpen.value = true
}}
```

**Close triggers** (Cancel button, modal close event):
- Cancel button `onClick`: `revokeTarget.value = null` +
  `revokeDialogOpen.value = false`
- `onConfirmRevoke` success path already sets
  `revokeTarget.value = null`; add `revokeDialogOpen.value = false`

**No new dependencies**: `useSignalEffect` is already available from
`@preact/signals`.

**Import change**: add `useSignalEffect` to the `@preact/signals`
import; remove `useEffect` from `preact/hooks` import (if no longer
used elsewhere in the file).
