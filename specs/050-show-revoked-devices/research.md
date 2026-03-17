# Research: Show Revoked Devices in Profile

## Decisions

### Decision 1: Data retention strategy

**Decision**: Keep revoked devices in the database with `is_revoked = 1`.
Revocation is a soft delete — the row stays, the flag flips.

**Rationale**: User confirmed this explicitly. The `devices` table already uses
`is_revoked INTEGER NOT NULL DEFAULT 0` as the revocation mechanism. The
`revokeDevice` DB function already sets `is_revoked = 1` rather than deleting
rows.

**Alternatives considered**: Hard delete (DELETE FROM devices) — rejected
because it would lose audit history and prevent showing revoked devices.

---

### Decision 2: Which DB query to use for the device list

**Decision**: Switch `listRegisteredDevices` in `auth/index.ts` from
`listActiveDevicesByUserId` to `listDevicesByUserId`.

**Rationale**: `listDevicesByUserId` already exists in `db/index.ts` and
returns all devices for a user regardless of `is_revoked` status. It orders
by `last_used_at DESC, created_at ASC` (active/most-recently-used first
naturally). No new SQL needed.

**Alternatives considered**: Adding a new query — unnecessary, the function
exists.

---

### Decision 3: UI treatment for revoked devices

**Decision**: Show revoked devices in the same list with `opacity: 0.4` and
a "Revoked" status label. No "Revoke" button on revoked entries.

**Rationale**: User specified 0.4 opacity. A text label ("Revoked") makes the
status accessible for screen readers, since opacity alone is not sufficient.

**Alternatives considered**: Separate section or collapsed group — not
requested; single list is simpler.

---

### Decision 4: Client-side filtering

**Decision**: Remove the `activeDevices` computed filter in `profile.ts`.
Use the full `state.devices.value.data` array directly; apply per-device
conditional rendering for the revoke button and opacity.

**Rationale**: The API already returns all devices (after the server-side
fix). The `isRevoked` flag is already present on each `DeviceInfo` object.
No new state or API fields needed.

**Alternatives considered**: Keep two separate computed lists (active /
revoked) — unnecessary complexity for a single list render.
