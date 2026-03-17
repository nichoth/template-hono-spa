---
description: "Task list for implementing the Show Revoked Devices changes"
---

# Tasks: Show Revoked Devices in Profile

**Input**: Design documents from `/specs/050-show-revoked-devices/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`
**Tests**: Automated tests are not requested; rely on the independent manual tests described under each user story and the shared verification tasks in the final phase.
**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Align on scope, priorities, and existing data/state before touching source files

- [X] T001 [P] Review `specs/050-show-revoked-devices/plan.md` to confirm the exact files and APIs that must change to include revoked devices in the profile list.
- [X] T002 [P] Review `specs/050-show-revoked-devices/spec.md` to capture the P1/P2 narratives, success criteria, and independent test steps for later verification.
- [X] T003 [P] Review `specs/050-show-revoked-devices/data-model.md` and `specs/050-show-revoked-devices/research.md` to understand the `devices` table, retained `is_revoked` flag, and UI treatment decisions that drive the implementation.

---

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Make the backend surface all devices so any client rendering change can be built on the same data

- [X] T004 In `src/server/auth/index.ts`, keep `ensureAuthSchema` and switch `listRegisteredDevices` to call `listDevicesByUserId` instead of `listActiveDevicesByUserId`, updating the import list so the auth API now returns every device (revoked and active).

---

## Phase 3: User Story 1 - View All Devices Including Revoked (Priority: P1) 🎯 MVP
**Goal**: Render the entire device list, including revoked entries, with a visual tag that exposes revocation status.
**Independent Test**: As an authenticated passkey user with both active and revoked devices, visit `/profile` and confirm all entries appear in the Devices list with revoked rows visually marked while active rows remain unchanged.

### Implementation for User Story 1
- [X] T005 [US1] Replace all uses of the `activeDevices` computed signal inside `src/client/routes/profile.ts` so the rendered list iterates directly over `state.devices.value.data ?? []`, guaranteeing both active and revoked devices are emitted in the DOM.
- [X] T006 [US1] In `src/client/routes/profile.ts`, apply `device-item--revoked` when `device.isRevoked` is true, insert a `<span class="device-revoked-label">Revoked</span>` beside the device name, and keep the current-device indicator logic intact so revoked rows stay informative.
- [X] T007 [US1] Add `.device-item--revoked` (opacity 0.4) and `.device-revoked-label` (uppercased, smaller text, letter spacing) rules in `src/client/routes/profile.css` to match the requested visual treatment from the research decisions.

---

## Phase 4: User Story 2 - No Revoke Action on Revoked Devices (Priority: P2)
**Goal**: Keep the revoke workflow available for active devices while completely omitting revoke actions from revoked entries.
**Independent Test**: Visit `/profile` with revoked devices and assert that the revoked rows render no Revoke button yet continue to disable the button for the last remaining active device/current device.

### Implementation for User Story 2
- [X] T008 [US2] Wrap the `Revoke` button markup in `src/client/routes/profile.ts` so it only renders when `device.isRevoked` is false, while preserving the existing `disabled`, `title`, and `current device` checks for active entries.
- [X] T009 [US2] Adjust the `canRevoke` computed signal in `src/client/routes/profile.ts` so it counts only non-revoked devices (still filtering to `state.devices.value.data ?? []`) while continuing to protect the current session device and the last active device logic.

---

## Phase N: Polish & Cross-Cutting Concerns
**Purpose**: Capture verification evidence and keep the feature discovery documented.

- [ ] T010 Run `npm test` as defined in `package.json` to ensure the existing automated suite stays green after the changes.
- [X] T011 [P] Record the manual verification steps (US1 and US2 independent tests) inside `specs/050-show-revoked-devices/checklists/requirements.md` or an adjacent verification note so the QA tester knows what to rerun if needed.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies; reading the docs can occur before editing code.
- **Foundational (Phase 2)**: Depends on Setup being complete; this server change supplies the data needed by both user stories.
- **User Stories (Phase 3 & 4)**: Both require Phase 2 to complete. US1 (P1) should be delivered first to keep the MVP narrow, while US2 (P2) builds on top of the same markup and data.
- **Polish (Phase N)**: Depends on all story implementation tasks completing so tests and documentation can reflect the finished behavior.

### User Story Dependencies
- **User Story 1 (P1)**: Can start once the foundational backend change is complete; no dependency on US2.
- **User Story 2 (P2)**: Depends on the backend change and the new device list markup so it can hide the button safely, but it can be implemented alongside US1 once T005/T006 are underway.

### Within Each User Story
- Keep tests (manual/instructions) defined before implementation to know what to validate after coding.
- Apply markup updates before styling and button removal to keep each change reviewable.
- Confirm US1 tasks finish before finishing US2 for MVP sequencing, but US2 can be validated independently once the button logic is isolated.

## Parallel Execution Examples

### User Story 1 (P1)
```bash
# T005 can run while T006 is implemented because they both touch `profile.ts` but update different code paths (list iteration vs. per-item markup).
# T007 (CSS styling) can run in parallel with T006 once the markup for `.device-item--revoked` exists.
```

### User Story 2 (P2)
```bash
# T008 updates the button rendering branch while T009 tweaks the `canRevoke` computed signal; both stay within `profile.ts` and focus on non-revoked entries, so they can be worked on by different reviewers if locked to different commits.
```

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 to align on scope.
2. Complete Phase 2 so the API returns revoked devices.
3. Finish Phase 3 so the profile list renders the full device set with a revoked badge and styling (US1).
4. Stop and validate US1 by executing the independent test scenario before expanding to US2.

### Incremental Delivery
1. Deliver Setup + Foundational (Phases 1-2) → Foundation ready for both stories.
2. Implement US1 (Phase 3) → Verify the list shows revoked devices correctly and style matches the spec.
3. Implement US2 (Phase 4) → Verify revoked rows no longer display revoke actions.
4. Finalize polish tasks (Phase N) by running `npm test` and documenting the manual verification steps.

### Parallel Strategy
1. After Foundation is complete, US1 and US2 tasks can be split across reviewers: one focuses on markup/styling, the other on button logic, as long as shared `profile.ts` sections are coordinated.
2. The final verification tasks (T010/T011) can occur as soon as the code changes land because they rely on completed feature code.

## Notes
- The specification already measures success through the independent tests described above; follow those manual steps before marking each user story as done.
- No automated tests were requested, so rely on `npm test` for regression coverage and manual verification for user-facing behavior.
