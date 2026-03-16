# Quickstart: Indicate Current Device

## Overview

This feature has three parts:
1. **Schema migration** — record `device_id` in the session row
2. **"(current device)" label** — shown inline in the device list
3. **Confirmation dialog** — warn before revoking the current device

---

## Part 1: Schema Migration

### 1a. `src/server/db/schema.ts`

Add `device_id TEXT` to the `sessions` CREATE TABLE (so fresh installs have
the column):

```sql
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    revoked_at INTEGER,
    last_seen_at INTEGER NOT NULL,
    device_id TEXT,                         -- NEW
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### 1b. `src/server/db/index.ts`

**SessionRecord type** — add `device_id: string | null`.

**`createSession` params** — add optional `deviceId?: string`; include it in
the INSERT:

```ts
INSERT INTO sessions (
    id, user_id, session_token, status,
    created_at, expires_at, last_seen_at, device_id
)
VALUES (?, ?, ?, 'active', ?, ?, ?, ?)
```
Bind `params.deviceId ?? null` as the last value.

**`ensureAuthSchema` migration** — after the main `db.batch(...)` call, add:

```ts
try {
    await db.prepare(
        'ALTER TABLE sessions ADD COLUMN device_id TEXT'
    ).run()
} catch {
    // Column already exists — ignore
}
```

---

## Part 2: Auth Service

### `src/server/auth/index.ts`

**`SessionResponse` type** — add `currentDeviceId: string | null` to the
`authenticated: true` branch.

**`makeAuthenticatedSessionResponse`** — add a `deviceId: string | null`
parameter; include it as `currentDeviceId` in the return object.

**`finishAuthentication`** — `device` is already resolved before
`createSession` is called. Pass `device.id` to both:
```ts
const session = await createSession(db, {
    ...,
    deviceId: device.id,
})
// ...
response: makeAuthenticatedSessionResponse(user, session.expires_at, device.id),
```

**`getCurrentSession`** — add to the return object:
```ts
currentDeviceId: session.device_id ?? null,
```

---

## Part 3: Client Types

### `src/client/state.ts`

Add `currentDeviceId?: string | null` to the `authenticated: true` branch of
`SessionResponse`.

---

## Part 4: Profile Component

### `src/client/routes/profile.ts`

**Imports** — add:
```ts
import { ModalWindow } from '@substrate-system/dialog'
```

**Signals** — add one new signal:
```ts
const confirmRevokeDeviceId = useSignal<string | null>(null)
```

**`currentDeviceId` computed** — derive from session:
```ts
const currentDeviceId = useComputed(() => {
    const data = state.user.value.data
    return data?.authenticated === true ?
        (data.currentDeviceId ?? null) :
        null
})
```

**Dialog ref** — add:
```ts
const dialogRef = useRef<InstanceType<typeof ModalWindow> | null>(null)
```

**Revoke button `onClick`** — gate on current device:
```ts
onClick=${() => {
    if (device.deviceId === currentDeviceId.value) {
        confirmRevokeDeviceId.value = device.deviceId
        dialogRef.current?.open()
    } else {
        onRevokeDevice(device.deviceId)
    }
}}
```

**"(current device)" label** — inline in the device-name span:
```html
<span class="device-name">
    ${device.credentialName || 'Unnamed'}
    ${device.deviceId === currentDeviceId.value ?
        html`<span class="device-current">
            (current device)
        </span>` :
        null
    }
</span>
```

**Confirmation dialog** — add outside the device list, inside the section:
```html
<${ModalWindow.TAG}
    ref=${dialogRef}
>
    <h2>Revoke current device?</h2>
    <p>
        Revoking this device will immediately end your
        current session and log you out.
    </p>
    <div class="dialog-actions">
        <${SubstrateButton.TAG}
            type="button"
            onClick=${() => {
                dialogRef.current?.close()
                confirmRevokeDeviceId.value = null
            }}
        >
            Cancel
        <//>
        <${SubstrateButton.TAG}
            type="button"
            onClick=${async () => {
                const id = confirmRevokeDeviceId.value
                dialogRef.current?.close()
                confirmRevokeDeviceId.value = null
                if (id) await onRevokeDevice(id)
            }}
        >
            Revoke and log out
        <//>
    </div>
<//>
```

### `src/client/routes/profile.css`

Add at the top:
```css
@import url("@substrate-system/dialog/css");
```

Add styles for dialog actions and current-device label:
```css
& .device-current {
    font-size: 0.8em;
    color: var(--color-text-muted, #6c757d);
    margin-left: 0.4em;
}

& .dialog-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
}
```

---

## Verification

```bash
npm test && npm run lint
```

Manual check:
1. Log in with a passkey → profile page → current device shows
   "(current device)".
2. Click Revoke on the current device → confirmation dialog appears with
   logout warning.
3. Click Cancel → dialog closes, nothing revoked.
4. Click Revoke on a non-current device → immediate revoke, no dialog.
5. Click "Revoke and log out" on current device → revoked, session ends,
   user is redirected/logged out.
