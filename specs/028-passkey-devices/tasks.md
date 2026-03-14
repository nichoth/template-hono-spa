---

description: "Tasks for implementing the passkey device backend"
---

# Tasks: Passkey device backend

**Input**: Design docs from `/specs/028-passkey-devices/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the D1 schema definitions requested by the spec before any story work begins

- [x] T001 Update `src/server/db/schema.ts` so `AUTH_SCHEMA_STATEMENTS` creates `users` (uuid primary key, handle, identifier/email snapshot, created_at) and `devices` (FK to `users`, credential metadata, transports array, aaguid, credential_name, timestamps, is_revoked flag) tables instead of the legacy `passkey_credentials` construct.
- [x] T002 Ensure `src/server/db/index.ts` exposes the updated `AUTH_SCHEMA_STATEMENTS`, `AUTH_SCHEMA_SQL`, and runs the new statements in `ensureAuthSchema` so every D1 binding can create the revised tables before executing feature logic.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the reusable DB helpers for the new tables that every user story will rely on.

- [x] T003 Define the `UserRecord` (including `handle` and email snapshot) and new `DeviceRecord` types in `src/server/db/index.ts`, and grow the module with helpers for inserting users/devices (including metadata), bumping counters + last_used_at, listing devices by `user_id`, finding a device by `credential_id`, and flagging a device as revoked.
- [x] T004 Update `createUser`, `findUserById`, and `createSession` helpers inside `src/server/db/index.ts` so they return the expanded user shape required by the success criteria (user handle persists, timestamps match, etc.) and so other modules can consume the enriched `DeviceRecord`.

---

## Phase 3: User Story 1 - Register passkey-enabled device (Priority: P1) 🎯 MVP

**Goal**: Persist a UUID-backed user plus a first device row whenever a WebAuthn registration completes so the passkey can log in later.

**Independent Test**: Run the registration flow and assert the new `users` row plus linked `devices` row exist with credential metadata.

- [x] T005 [US1] Enhance `finishRegistration` in `src/server/auth/index.ts` to write the new `users` row (with handle/email) and the associated device row (credential_id, public_key, counter 0, transports, AAGUID, credential_name, timestamps, is_revoked false) via the DB helpers, and return the user/device identifiers in the response.
- [x] T006 [US1] Add the `/api/auth/passkey/register` endpoint in `src/server/index.ts` that accepts the registration payload defined in `contracts/passkey-auth-api.md`, invokes `authService.finishRegistration`, and maps duplicate `credential_id` attempts to `409 Conflict` as described in the contract.

---

## Phase 4: User Story 2 - Authenticate via existing passkey (Priority: P1)

**Goal**: Accept a passkey login assertion, verify it against the stored device row, bump the counter, and return the owning user as defined by the contract.

**Independent Test**: Submit a login assertion for a valid credential and verify the response includes the user object while the counter and `last_used_at` update.

- [x] T007 [US2] Update `finishAuthentication` in `src/server/auth/index.ts` so it resolves the device via `credential_id`, rejects revoked devices, validates the stored public key, increments the counter/`last_used_at`, and emits the user object (id, handle, email snapshot) that will be returned to the client.
- [x] T008 [US2] Introduce `/api/auth/passkey/login` in `src/server/index.ts` that accepts the credential ID/challenge/signature payload, calls `finishAuthentication`, and returns the authenticated user while keeping failures (`401 Unauthorized`) for missing or revoked credentials per `passkey-auth-api.md`.

---

## Phase 5: User Story 3 - Revoke lost devices (Priority: P2)

**Goal**: Allow administrators or automation to list and revoke individual device credentials so stolen devices can no longer authenticate.

**Independent Test**: List devices for a user, revoke one, and assert login with that credential immediately fails while other devices still work.

- [x] T009 [US3] Add `GET /api/auth/passkey/devices?userId=<UUID>` in `src/server/index.ts` that queries `listDevicesByUserId`, sorts results by `last_used_at`, and returns each device with its `is_revoked` flag so audit tooling can show device metadata.
- [x] T010 [US3] Implement `PATCH /api/auth/passkey/devices/:deviceId/revoke` in `src/server/index.ts` that flags `is_revoked` via the new DB helper and returns `204 No Content`, ensuring login attempts for that credential are rejected in `finishAuthentication`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tie up documentation/audit needs and confirm the flow end-to-end.

- [x] T011 Update `specs/028-passkey-devices/quickstart.md` or relevant README sections to reflect the new `/api/auth/passkey/*` routes and describe how to verify users/devices in D1 so operators can rerun the verification steps after deployment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must complete before foundational work begins to ensure D1 schema matches the spec.
- **Foundational (Phase 2)**: Blocks user stories until the DB helpers exist.
- **User Stories (Phase 3-5)**: Each depends on Phase 2 but they can run in priority order or in parallel once Phase 2 is done.
- **Polish (Phase 6)**: Waits until all stories reach a stable state.

### User Story Dependencies

- **US1**: Depends on the foundational helpers (T003/T004) and the schema updates.
- **US2**: Depends on US1 data structures but can run concurrently with US1 once foundational work finishes.
- **US3**: Depends on the device helpers and US2 to ensure revoked devices are checked during login.

### Parallel Opportunities

- Schema updates in Phase 1 are blocking and should run sequentially.
- Phase 2 helpers can run in parallel with documentation work for the modified schema if resourced accordingly.
- Once Phase 2 is complete, US1, US2, and US3 tasks can proceed in parallel because they touch different routes (`/register`, `/login`, `/devices`) and can be staffed separately.

## Implementation Strategy

- **MVP Scope**: Ship User Story 1 first so a passkey registration produces the required `users`/`devices` rows, then layer US2 and US3 for login and revocation.
- **Incremental Delivery**: Build the schema/helpers (Phases 1-2) → complete the register story (Phase 3) → add login and revocation endpoints (Phases 4-5) → polish docs (Phase 6).
- **Testing Approach**: Manual verification via the updated quickstart steps ensures the new D1 rows exist; automated integration tests may be added later once the new contracts stabilize.
