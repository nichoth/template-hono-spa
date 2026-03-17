# Tasks: Fix Modal Reopen State

**Input**: Design documents from `/specs/049-fix-modal-reopen/`
**Prerequisites**: plan.md, spec.md, research.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

This is a single-file change with no new infrastructure required. No
setup phase tasks are needed.

---

## Phase 2: User Story 1 - Reopen Revoke Modal (Priority: P1) MVP

**Goal**: The revoke confirmation modal opens correctly every time
"Revoke" is clicked, regardless of prior dismissals in the same
session.

**Independent Test**: Click "Revoke" on a device. Close the modal via
Cancel. Click "Revoke" on the same device again. Verify the modal
opens.

### Implementation

- [x] T001 [US1] In `src/client/routes/profile.ts`, add
  `useSignalEffect` to the `@preact/signals` import line

- [x] T002 [US1] In `src/client/routes/profile.ts`, remove `useEffect`
  from the `preact/hooks` import (only if it is no longer used
  elsewhere in the file after T003)

- [x] T003 [US1] In `src/client/routes/profile.ts`, add a new signal
  `const revokeDialogOpen = useSignal(false)` alongside the existing
  `revokeTarget` signal declaration

- [x] T004 [US1] In `src/client/routes/profile.ts`, replace the
  existing `useEffect` block (lines 110-118) that calls
  `modal.open()`/`modal.close()` with a `useSignalEffect` block that
  reads `revokeDialogOpen.value` and calls `modal.open()` or
  `modal.close()` accordingly

- [x] T005 [US1] In `src/client/routes/profile.ts`, update the Revoke
  button `onClick` handler to set both `revokeTarget.value = device`
  and `revokeDialogOpen.value = true`

- [x] T006 [US1] In `src/client/routes/profile.ts`, update the Cancel
  button `onClick` handler inside the modal to set both
  `revokeTarget.value = null` and `revokeDialogOpen.value = false`

- [x] T007 [US1] In `src/client/routes/profile.ts`, update
  `onConfirmRevoke` to set `revokeDialogOpen.value = false` when the
  revoke succeeds (alongside the existing `revokeTarget.value = null`)

**Checkpoint**: Modal opens on every "Revoke" click, including
re-opens on the same device. Cancel closes the modal and allows it
to be re-opened.

---

## Phase 3: Polish

- [x] T008 Run `npm test && npm run lint` and fix any errors in
  `src/client/routes/profile.ts`

---

## Dependencies & Execution Order

- T001 through T003 are independent and can be applied in any order.
- T004 depends on T001 and T003 (needs the import and new signal).
- T005 depends on T003 (needs `revokeDialogOpen` signal).
- T006 depends on T003.
- T007 depends on T003.
- T002 depends on T004 (only safe to remove `useEffect` import after
  the `useEffect` call is replaced).
- T008 depends on all prior tasks.

### Parallel Opportunities

T001, T003 can be applied simultaneously (different lines, no
conflict). T005, T006, T007 can all be written after T003 is in place.

---

## Implementation Strategy

This is an MVP-only change: one user story, one file, seven edits plus
a lint check. Complete all tasks sequentially, then validate manually
in the browser before closing the branch.
