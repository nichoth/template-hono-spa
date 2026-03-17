# Quickstart: Require Device Name

**Feature**: 043-require-device-name
**Date**: 2026-03-15

## Overview

Two targeted edits to `src/client/routes/profile.ts`:

1. Change the label from `"Device name (optional)"` to
   `"Device name"`.
2. Extend the `disabled` prop on the "Add device" button to also
   check that the trimmed name value is non-empty.

## File Changed

```
src/client/routes/profile.ts
```

## Edits

### 1. Label text (line 345)

```diff
- <span>Device name (optional)</span>
+ <span>Device name</span>
```

### 2. Button disabled condition (line 363)

```diff
- disabled=${addDevicePending.value}
+ disabled=${addDevicePending.value ||
+     addDeviceName.value.trim() === ''}
```

## Verification

```sh
npm test && npm run lint
```

Then manually visit `/profile` as a passkey user and confirm:
- Label reads "Device name" (no "(optional)").
- "Add device" button is disabled on load.
- Typing a name enables the button.
- Whitespace-only input keeps the button disabled.
- Successful submission clears the field and disables the button
  again.
