# Tasks: Confirm Revoke Device

**Input**: Design documents from `/specs/048-confirm-revoke-device/`
**Prerequisites**: plan.md (required), spec.md (required)

**Organization**: Tasks grouped by user story to enable independent
implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths included in each description

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Modal state infrastructure required by both user stories.

**Note**: No new project setup needed — this is a frontend-only change
to an existing component. These tasks establish the signal/ref scaffolding
that US1 and US2 both depend on.

- [X] T001 Add modal state signals and ref to profile component in `src/client/routes/profile.ts`: import `ModalWindow` from `@substrate-system/dialog`; add `revokeTarget = useSignal<DeviceInfo | null>(null)`; add `revokeDialogError = useSignal<string | null>(null)`; add `revokeDialogRef = useRef<ModalWindow | null>(null)`; add `useEffect` to call `.open()` / `.close()` on ref when `revokeTarget` changes
- [X] T002 Refactor revoke button handler in `src/client/routes/profile.ts`: change `onClick` from calling `onRevokeDevice` directly to `revokeTarget.value = device`; remove `spinning`/`disabled` attributes from the list button

**Checkpoint**: Modal signals and button handler wired — user story work
can now begin.

---

## Phase 2: User Story 1 - Confirm Before Revoking (Priority: P1) MVP

**Goal**: Clicking "Revoke" on a device opens a confirmation modal with
the device name and a submit button that calls the API, shows a spinner,
closes on success, and shows an inline error on failure.

**Independent Test**: Navigate to the device list, click Revoke on a
device, observe the confirmation modal with the device name, click
"Revoke this device", and verify the device disappears from the list.

### Implementation for User Story 1

- [X] T003 [US1] Add modal submit handler in `src/client/routes/profile.ts`: rename/refactor `onRevokeDevice` to set `revokePending`, clear `revokeDialogError`, call `State.revokeDevice`, set `revokeTarget.value = null` on success, set `revokeDialogError.value = err.message` on failure, clear `revokePending` in finally
- [X] T004 [US1] Render confirmation modal markup in `src/client/routes/profile.ts`: add `modal-window` element below device list with `noclick` when `revokePending` is set; include `<h2>` with device name, `.dialog-actions` div containing Cancel button and Revoke button (with `spinning`/`disabled` wired to `revokePending`), and `<p class="device-error">` for `revokeDialogError`
- [X] T005 [P] [US1] Update integration tests for confirm flow in `test/integration.spec.ts`: verify clicking Revoke does not call API immediately; modal appears with correct device name; clicking "Revoke this device" in modal calls API and closes modal on success; API error leaves modal open with error text visible

**Checkpoint**: User Story 1 is fully functional — confirm-and-revoke
flow works end to end.

---

## Phase 3: User Story 2 - Cancel Revocation Mid-Flow (Priority: P2)

**Goal**: A user who accidentally triggered the revoke flow can cancel
via the Cancel button, Escape key, or backdrop click — with no side
effects.

**Independent Test**: Open the confirmation modal, dismiss it via each
cancel path (button, Escape, backdrop click), confirm no API call was
made and the device list is unchanged.

### Implementation for User Story 2

**Note**: Cancel and dismiss behaviour (Escape key, backdrop click) is
provided by `@substrate-system/dialog` automatically. The Cancel button
in the modal markup (added in T004) sets `revokeTarget.value = null`.
This phase adds only the integration tests to verify each cancel path.

- [X] T006 [US2] Update integration tests for cancel paths in `test/integration.spec.ts`: verify Cancel button closes modal without API call; verify backdrop click closes modal without API call; verify Escape key closes modal without API call; verify device list is unchanged after each cancel path

**Checkpoint**: User Stories 1 and 2 both function independently and
all cancel paths are covered by tests.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Visual refinement and final validation.

- [X] T007 [P] Add danger button CSS in `src/client/routes/profile.css`: inside `.route.profile`, add `& .dialog-revoke-btn` rule with `--substrate-button-bg`, `--substrate-button-bg-hover`, `--substrate-button-color` CSS variables (verify exact variable names against `@substrate-system/button` source)
- [X] T008 Run `npm test && npm run lint` and fix any failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **User Stories (Phase 2–3)**: Depend on Phase 1 completion
  - US1 and US2 tasks can overlap once T001–T002 are done
  - T006 (US2 tests) can be written in parallel with T003–T005 (US1)
- **Polish (Phase 4)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational phase (T001, T002)
- **US2 (P2)**: Depends on Foundational phase (T001, T002) and modal
  markup (T004) — cancel button lives in the modal rendered by T004

### Within Each Phase

- T001 must complete before T002 (ref/signal imports needed first)
- T003 and T004 can run in parallel (same file but non-overlapping
  sections — coordinate to avoid conflicts)
- T005 and T006 are test tasks that can be written once modal markup
  exists (after T004)

### Parallel Opportunities

- T005 (US1 tests) and T007 (CSS) can run in parallel after T004
- T006 (US2 tests) can be written alongside T005

---

## Parallel Example: User Story 1

```bash
# After T001 + T002 complete:
Task A: T003 — modal submit handler in src/client/routes/profile.ts
Task B: T004 — modal markup in src/client/routes/profile.ts
# (coordinate on same file — non-overlapping sections)

# After T004 complete:
Task C: T005 — integration tests for confirm flow
Task D: T007 — danger button CSS (can start any time)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Foundational (T001–T002)
2. Complete Phase 2: User Story 1 (T003–T005)
3. **STOP and VALIDATE**: Test confirm-and-revoke flow end to end
4. Ship if ready

### Incremental Delivery

1. Foundational → modal state wired
2. US1 → confirm flow works (MVP)
3. US2 → cancel paths tested and verified
4. Polish → visual refinement + final lint pass

---

## Notes

- [P] tasks = different files or non-overlapping sections, no
  dependencies on in-progress work
- No backend changes — all work is confined to `profile.ts`,
  `profile.css`, and `test/integration.spec.ts`
- Verify `@substrate-system/button` CSS variable names before
  finalising T007
- Commit after each task or logical group
