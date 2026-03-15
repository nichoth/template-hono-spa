# Tasks: Add Passkey Device

**Input**: Design documents from
`/specs/040-add-passkey-device/`
**Prerequisites**: plan.md, spec.md, research.md,
data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no deps)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: No new project structure needed. Existing files
are modified. This phase covers only the shared DB helper
that multiple stories depend on.

- [x] T001 Add `countActiveDevicesByUserId` helper to src/server/db/index.ts -- returns count of non-revoked devices for a user via `SELECT COUNT(*) FROM devices WHERE user_id = ? AND is_revoked = 0`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth service methods and Hono route scaffolding
that MUST be complete before any user story UI can work.

- [x] T002 Add `startDeviceRegistration` method to `createAuthService` in src/server/auth/index.ts -- accept `db`, `requestUrl`, `userId`, optional `credentialName`; look up user by ID; call `countActiveDevicesByUserId` and reject if >= 10; call `listActiveDevicesByUserId` to build `excludeCredentials`; call `generateRegistrationOptions` with the existing user identity; create challenge with purpose `'device_addition'` and metadata `{ credentialName }`; return `{ challengeReference, options }`
- [x] T003 Add `finishDeviceRegistration` method to `createAuthService` in src/server/auth/index.ts -- accept `db`, `requestUrl`, `userId`, `challengeReference`, `credential`, optional `credentialName`; find challenge by ID and validate purpose is `'device_addition'`, status is `'pending'`, not expired; call `verifyRegistrationResponse`; check for duplicate credential ID via `findDeviceByCredentialId`; re-check device count < 10; call `createDevice` with credential metadata; mark challenge used; log auth event (success or failure); return `{ status: 'device_added', device: { deviceId, credentialName, createdAt } }`
- [x] T004 Add type exports for `DeviceRegistrationStartRequest`, `DeviceRegistrationStartResponse`, `DeviceRegistrationFinishRequest`, and `DeviceRegistrationFinishResponse` in src/server/auth/index.ts
- [x] T005 Update `revokeRegisteredDevice` in src/server/auth/index.ts -- accept `userId` parameter in addition to `deviceId`; look up the device and verify `device.user_id === userId` (throw 403 `not_owner` if mismatch); call `countActiveDevicesByUserId` and throw 409 `last_device` if count <= 1; then proceed with existing revocation logic
- [x] T006 Export `startDeviceRegistration`, `finishDeviceRegistration` from the `createAuthService` return object in src/server/auth/index.ts
- [x] T007 Add `POST /api/auth/passkey/devices/register/start` route in src/server/index.ts -- read session cookie via `getCookie`, call `authService.getCurrentSession`; reject 401 if not authenticated; reject 403 if `loginMethod !== 'passkey'`; parse `{ credentialName }` from request body; call `authService.startDeviceRegistration` with user ID from session; return the challenge reference and options
- [x] T008 Add `POST /api/auth/passkey/devices/register/finish` route in src/server/index.ts -- read session cookie, validate session (401 if not authenticated); parse `{ challengeReference, credential, credentialName }` from body; call `authService.finishDeviceRegistration` with user ID from session; return the device info response
- [x] T009 Update `GET /api/auth/passkey/devices` route in src/server/index.ts -- replace `userId` query parameter with session-cookie-based user lookup; reject 401 if not authenticated; add `createdAt` field to response objects (map `device.created_at` to ISO string)
- [x] T010 Update `PATCH /api/auth/passkey/devices/:deviceId/revoke` route in src/server/index.ts -- read session cookie, validate session (401 if not authenticated); pass `userId` from session to `authService.revokeRegisteredDevice` so it can enforce ownership and last-device protection

**Checkpoint**: All backend endpoints are functional.
Client work can now begin.

---

## Phase 3: User Story 1 - Add a new passkey from an authenticated session (Priority: P1)

**Goal**: An authenticated passkey user can register a
second passkey and use it to sign in independently.

**Independent Test**: Sign in, click "Add device," complete
the WebAuthn ceremony, verify new device appears in list,
sign out, sign in with the new device.

### Implementation for User Story 1

- [x] T011 [US1] Add `State.addDevice` to src/client/state.ts -- accept optional `credentialName`; POST to `/api/auth/passkey/devices/register/start` with `{ credentialName }`; call `beginBrowserRegistration` from `@simplewebauthn/browser` with the returned options; POST to `/api/auth/passkey/devices/register/finish` with `{ challengeReference, credential, credentialName }`; return the device info from the response
- [x] T012 [US1] Add "Add device" button to the profile page in src/client/routes/profile.ts -- only visible when `loginMethod === 'passkey'`; on click, call `State.addDevice`; show loading spinner during the ceremony; show success message or error on completion; after success, refresh the device list

**Checkpoint**: User Story 1 is functional. Users can add
a new passkey from their profile.

---

## Phase 4: User Story 2 - View registered devices (Priority: P1)

**Goal**: Authenticated passkey users can see all their
registered devices with name, creation date, and last-used
date.

**Independent Test**: Sign in, navigate to profile, verify
all registered devices are listed with correct metadata.

### Implementation for User Story 2

- [x] T013 [US2] Add `State.listDevices` to src/client/state.ts -- GET `/api/auth/passkey/devices`; return array of device objects; add a `devices` signal to `AppState` typed as `RequestFor<DeviceInfo[], HTTPError|Error>` where `DeviceInfo` includes `deviceId`, `credentialName`, `createdAt`, `lastUsedAt`, `isRevoked`
- [x] T014 [US2] Add device list section to the profile page in src/client/routes/profile.ts -- only visible when `loginMethod === 'passkey'`; call `State.listDevices` on mount; render each device as a card/row showing credential name, created date (formatted), last used date (formatted or "Never"); show loading and error states using `@substrate-system/state` pattern
- [x] T015 [P] [US2] Add device list styles in src/client/routes/profile.css -- style device cards/rows with name, dates; responsive layout; consistent with existing profile card styling

**Checkpoint**: User Story 2 is functional. Users can see
their device list on the profile page.

---

## Phase 5: User Story 3 - Name a newly added device (Priority: P2)

**Goal**: Users can provide a friendly name when adding a
device. If no name is given, a default is assigned.

**Independent Test**: Add a device with a custom name and
verify it displays in the list. Add a device without a
name and verify a default name appears.

### Implementation for User Story 3

- [x] T016 [US3] Add a credential name input to the add-device flow in src/client/routes/profile.ts -- show a text input (optional) before starting the WebAuthn ceremony; pass the value to `State.addDevice`; if the input is empty, let the server assign a default name
- [x] T017 [US3] Add default credential name logic to `startDeviceRegistration` in src/server/auth/index.ts -- if `credentialName` is not provided, generate a default like `"Device N"` where N is the current active device count + 1; store in challenge metadata so `finishDeviceRegistration` can use it

**Checkpoint**: User Story 3 is functional. Device naming
works with both custom and default names.

---

## Phase 6: User Story 4 - Revoke a registered device (Priority: P2)

**Goal**: Users can revoke any device except their last
active one.

**Independent Test**: With 2+ devices, revoke one and
verify it disappears from the list and cannot be used to
sign in. With 1 device, verify revocation is blocked.

### Implementation for User Story 4

- [x] T018 [US4] Add `State.revokeDevice` to src/client/state.ts -- accept `deviceId`; PATCH `/api/auth/passkey/devices/${deviceId}/revoke`; on success, refresh the device list; handle error responses (last device, not owner)
- [x] T019 [US4] Add "Revoke" button per device in src/client/routes/profile.ts -- show a revoke button on each device card; disable the button if there is only 1 active device (client-side guard); on click, confirm with the user, then call `State.revokeDevice`; show loading state during the request; on success, remove the device from the list; on error, show the error message

**Checkpoint**: User Story 4 is functional. Users can
revoke devices with last-device protection.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T020 [P] Add aria attributes and keyboard navigation to the device list and add-device flow in src/client/routes/profile.ts -- ensure the device list is announced to screen readers; add `aria-live` region for add/revoke feedback
- [x] T021 Verify all error paths return user-friendly messages -- review each error code in the add-device and revoke flows; ensure the client displays them clearly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001)
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 2 completion;
  can run in parallel with US1
- **Phase 5 (US3)**: Depends on US1 (T011, T012)
  because it extends the add-device flow
- **Phase 6 (US4)**: Depends on US2 (T013, T014)
  because it adds revoke to the device list UI
- **Phase 7 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US1 (Add device)**: Independent after Phase 2
- **US2 (View devices)**: Independent after Phase 2;
  can run in parallel with US1
- **US3 (Name device)**: Extends US1 add-device flow
- **US4 (Revoke device)**: Extends US2 device list UI

### Within Each User Story

- Backend (service + routes) before client state
- Client state before client UI
- Core flow before polish

### Parallel Opportunities

- T007 and T008 can run in parallel (different routes,
  same file but different sections)
- T009 and T010 can run in parallel (updating different
  existing routes)
- US1 and US2 client work can run in parallel after
  Phase 2 (different UI concerns)
- T015 (CSS) can run in parallel with T013/T014

---

## Parallel Example: Phase 2

```text
# After T001 (DB helper), these can run in parallel:
T002: startDeviceRegistration in auth/index.ts
T005: update revokeRegisteredDevice in auth/index.ts

# After T002 + T003, these can run in parallel:
T007: POST .../register/start route
T008: POST .../register/finish route
T009: Update GET .../devices route
T010: Update PATCH .../revoke route
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: DB helper (T001)
2. Complete Phase 2: Auth service + routes (T002-T010)
3. Complete Phase 3: Add device UI (T011-T012)
4. Complete Phase 4: Device list UI (T013-T015)
5. **STOP and VALIDATE**: Users can add and view devices
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational -> Backend ready
2. Add US1 (add device) -> Test independently -> Demo
3. Add US2 (view devices) -> Test independently -> Demo
4. Add US3 (naming) -> Enhances US1 -> Demo
5. Add US4 (revocation) -> Enhances US2 -> Demo
6. Polish -> Final release

---

## Notes

- No new files need to be created; all changes go into
  existing files
- The DB schema already supports everything needed
- Backend work (Phase 2) is the bulk of the effort;
  client work builds on existing patterns in state.ts
  and profile.ts
- WebAuthn ceremony requires manual browser testing;
  automated tests can cover the server-side logic
