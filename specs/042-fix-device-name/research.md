# Research: Fix Device Name Bug

## Root Cause

**Decision**: The bug is caused by a missing `onInput` event handler on the
`SubstrateInput` component in `src/client/routes/profile.ts`.

**Rationale**:
- `addDeviceName` is a Preact signal initialized to `''`
- The `SubstrateInput` at line 346-351 binds `value=${addDeviceName.value}`
  for display, but has no `onInput` handler to update the signal when the
  user types
- `onAddDevice()` reads `addDeviceName.value.trim() || undefined`, which is
  always `''` (empty), so the invitation is always created without a name,
  resulting in "Unnamed"

**Evidence from codebase**:
- Every other `SubstrateInput` / `substrate-input` in the project uses
  `onInput` with `event.target.value` — see `login.ts` lines 187-190 and
  `signup.ts` lines 151-154
- The server-side `createDeviceInvitation()`, the API route, and
  `State.createInvite()` all correctly accept and propagate an optional
  `deviceName` — there is no server-side bug

## Fix

Add `onInput` handler to the `SubstrateInput` in profile.ts:

```
onInput=${(event:InputEvent) => {
    addDeviceName.value =
        (event.target as HTMLInputElement).value
}}
```

No schema migrations, no API changes, no server-side changes needed.

## Tests Needed

Two unit/integration tests covering:
1. `createDeviceInvitation()` called with a name — returned invitation has
   that name
2. `createDeviceInvitation()` called without a name — returned invitation
   has `deviceName` as `null` or `undefined`, displayed as "Unnamed"

An existing test at `test/integration.spec.ts:1302` already calls
`createDeviceInvitation(..., 'Second Device')` but does not assert that the
returned invitation carries the name. A dedicated focused test should be
added.

## Alternatives Considered

- Using `onChange` instead of `onInput`: rejected — `onInput` fires on
  every keystroke (standard pattern used elsewhere in the project)
- Using a `ref` to read the input value at submit time: rejected — the
  project uses signals for form state; `onInput` is the established pattern
