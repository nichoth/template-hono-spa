# Tasks: Device Invite Link

**Input**: Design documents from
`/specs/041-device-invite-link/`
**Prerequisites**: plan.md, spec.md, research.md,
data-model.md, contracts/device-invite-contract.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files,
  no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Schema and shared DB helpers for invitations

- [x] T001 Add `device_invitations` table to
  `AUTH_SCHEMA_STATEMENTS` in
  `src/server/db/schema.ts`
- [x] T002 Add `DeviceInvitationRecord` type and DB
  helper functions (`createInvitation`,
  `findInvitationByCode`, `markInvitationConsumed`,
  `markInvitationCancelled`,
  `countPendingInvitationsByUserId`,
  `listPendingInvitationsByUserId`) in
  `src/server/db/index.ts`

---

## Phase 2: Foundational

**Purpose**: Auth service methods shared across stories

- [x] T003 Add `generateInviteCode` helper (6-digit
  numeric, collision-resistant) to
  `src/server/auth/index.ts`
- [x] T004 Add `DEVICE_INVITATION_TTL_MS` constant
  (15 minutes) to `src/server/auth/index.ts`

**Checkpoint**: DB layer and constants ready for all
user stories

---

## Phase 3: User Story 1 — Generate Device Invitation (P1)

**Goal**: Authenticated passkey user clicks "Add device",
gets an invitation URL displayed inline with a copy button.

**Independent Test**: Log in, enter device name, click
"Add device", verify a `/:handle/add/:code` URL appears
with a copy button.

### Server (US1)

- [x] T005 [US1] Add `createDeviceInvitation` method to
  auth service in `src/server/auth/index.ts` — validates
  session is passkey user, checks device+invitation limit
  (10), generates invite code, stores invitation record,
  returns `{ inviteCode, inviteUrl, deviceName, expiresAt }`
- [x] T006 [US1] Add `POST /api/auth/passkey/devices/invite`
  route in `src/server/index.ts` — session-gated, calls
  `createDeviceInvitation`, returns invitation JSON

### Client (US1)

- [x] T007 [US1] Add `DeviceInvitation` type and
  `invitations` signal to `AppState`, add
  `State.createInvite` method in `src/client/state.ts` —
  POSTs to `/api/auth/passkey/devices/invite`, stores
  result
- [x] T008 [US1] Replace the existing add-device WebAuthn
  flow in `src/client/routes/profile.ts` — remove
  `State.addDevice` call, replace with
  `State.createInvite`, show invite URL inline below
  the input with `@substrate-system/copy-button`
- [x] T009 [US1] Add styles for invitation URL display
  and copy button in `src/client/routes/profile.css`

**Checkpoint**: User can generate invitations and see the
URL. The URL doesn't do anything yet.

---

## Phase 4: User Story 2 — Register from New Device (P1)

**Goal**: New device visits `/:handle/add/:code`,
completes WebAuthn, device is saved to the account.

**Independent Test**: Visit a valid invitation URL on a
different device, complete passkey ceremony, verify device
appears in user's device list.

### Server (US2)

- [x] T010 [US2] Add `startInviteClaim` method to auth
  service in `src/server/auth/index.ts` — validates
  invite code (exists, pending, not expired), looks up
  user, generates WebAuthn registration options, creates
  challenge with purpose `'device_invitation'`, returns
  options + challenge reference
- [x] T011 [US2] Add `finishInviteClaim` method to auth
  service in `src/server/auth/index.ts` — validates
  challenge, verifies WebAuthn credential, creates device
  record with `credential_name` from invitation, marks
  invitation consumed
- [x] T012 [P] [US2] Add
  `POST /api/auth/passkey/devices/invite/:code/claim/start`
  and
  `POST /api/auth/passkey/devices/invite/:code/claim/finish`
  routes in `src/server/index.ts` — no session required,
  invite code is authorization

### Client (US2)

- [x] T013 [US2] Add client route `/:handle/add/:code` in
  `src/client/routes/index.ts` — register the route pattern,
  add to `knownClientRoutes` check with
  `isKnownClientRoute`
- [x] T014 [US2] Create `ClaimDeviceRoute` component in
  `src/client/routes/claim-device.ts` — reads `:handle`
  and `:code` from route params, calls claim/start
  endpoint, triggers `@simplewebauthn/browser`
  `startRegistration`, calls claim/finish endpoint,
  shows success/error states
- [x] T015 [P] [US2] Add `State.claimInvite` method in
  `src/client/state.ts` — orchestrates the claim/start →
  browser WebAuthn → claim/finish flow
- [x] T016 [P] [US2] Create styles for claim page in
  `src/client/routes/claim-device.css`
- [x] T017 [US2] Update `shouldServeShell` in
  `src/server/index.ts` to ensure `/:handle/add/:code`
  paths are served as SPA shell (verify it already works
  since no file extension, fix if needed)

**Checkpoint**: Full end-to-end flow works — generate
invitation on device A, open link on device B, register
passkey, device appears in list.

---

## Phase 5: User Story 3 — Invitation Expiration & Security (P2)

**Goal**: Expired and consumed invitations are rejected.
Users can cancel pending invitations.

**Independent Test**: Generate invitation, wait for
expiry (or manually set expired), visit link, verify
rejection message. Cancel a pending invite and verify it
becomes invalid.

### Server (US3)

- [x] T018 [US3] Add `cancelDeviceInvitation` method to
  auth service in `src/server/auth/index.ts` — validates
  ownership, checks status is `pending`, marks cancelled
- [x] T019 [US3] Add
  `DELETE /api/auth/passkey/devices/invite/:inviteCode`
  route in `src/server/index.ts` — session-gated, calls
  `cancelDeviceInvitation`

### Client (US3)

- [x] T020 [US3] Add `State.cancelInvite` method in
  `src/client/state.ts` — DELETEs the invitation
- [x] T021 [US3] Add cancel button next to each pending
  invitation in `src/client/routes/profile.ts`
- [x] T022 [US3] Update `ClaimDeviceRoute` in
  `src/client/routes/claim-device.ts` to handle error
  responses (expired → "This invitation has expired",
  consumed → "Already used", cancelled → "No longer
  valid") with clear user-facing messages

**Checkpoint**: Invalid invitations are properly rejected
with clear messages. Users can cancel from profile.

---

## Phase 6: User Story 4 — Pending Invitation Visibility (P3)

**Goal**: Profile page lists pending invitations with
status, remaining time, and cancel controls.

**Independent Test**: Generate one or more invitations,
view profile, verify pending invitations are listed with
device names and countdown/expiry info.

### Server (US4)

- [x] T023 [US4] Add
  `GET /api/auth/passkey/devices/invites` route in
  `src/server/index.ts` — session-gated, calls
  `listPendingInvitationsByUserId`, filters expired,
  returns array of pending invitations

### Client (US4)

- [x] T024 [US4] Add `State.listInvites` method and
  `invitations` signal loading in `src/client/state.ts`
- [x] T025 [US4] Add pending invitations list section to
  `src/client/routes/profile.ts` — shows device name,
  time remaining, cancel button per invitation
- [x] T026 [P] [US4] Add styles for pending invitations
  list in `src/client/routes/profile.css`

**Checkpoint**: Profile shows full invitation lifecycle
visibility.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T027 Remove the old same-device add-device server
  methods (`startDeviceRegistration`,
  `finishDeviceRegistration`) and their routes
  (`POST /api/auth/passkey/devices/register/start`,
  `POST /api/auth/passkey/devices/register/finish`)
  from `src/server/auth/index.ts` and
  `src/server/index.ts`
- [x] T028 Remove old `State.addDevice` method from
  `src/client/state.ts` and clean up any remaining
  references in `src/client/routes/profile.ts`
- [ ] T029 Run quickstart.md validation — walk through
  all 6 scenarios manually and verify behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2 (and Phase 3
  for the invitation to exist, but can be developed
  in parallel if a test invitation is seeded in DB)
- **Phase 5 (US3)**: Depends on Phase 3 (cancel) and
  Phase 4 (claim error handling)
- **Phase 6 (US4)**: Depends on Phase 2 (DB helpers
  already created in Phase 1)
- **Phase 7 (Polish)**: Depends on Phases 3-6

### User Story Dependencies

- **US1 (Generate Invitation)**: Independent after
  foundational
- **US2 (Claim from New Device)**: Needs invitations
  to exist (US1), but server code can be developed
  independently
- **US3 (Expiration & Cancel)**: Builds on US1 + US2
- **US4 (Pending Visibility)**: Independent after
  foundational (just reads DB)

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel.
US1 and US4 can be developed in parallel after Phase 2.

---

## Implementation Strategy

### MVP (US1 + US2)

1. Phase 1: Schema + DB helpers
2. Phase 2: Auth constants
3. Phase 3: Generate invitation (server + client)
4. Phase 4: Claim invitation (server + client)
5. **VALIDATE**: Full flow works end-to-end

### Incremental Delivery

6. Phase 5: Expiration/cancel handling
7. Phase 6: Pending invitation visibility
8. Phase 7: Remove old code, final validation

---

## Notes

- The `invite_code` is a 6-digit numeric string — short
  enough to type, unique in DB via UNIQUE constraint.
- The claim endpoints do NOT require a session cookie —
  the invite code itself is the authorization.
- `@substrate-system/copy-button` is already in
  package.json dependencies.
