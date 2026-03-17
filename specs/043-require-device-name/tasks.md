# Tasks: Require Device Name

**Input**: Design documents from `/specs/043-require-device-name/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

Single project: `src/` at repository root.

---

## Phase 1: Setup

**Purpose**: No new infrastructure required. Both changes land in a
single existing file.

- [x] T001 Read `src/client/routes/profile.ts` to confirm line
  numbers for the label and button `disabled` prop before editing

---

## Phase 2: User Story 1 - Add Device With Name (Priority: P1) MVP

**Goal**: The device name label no longer says "(optional)", and the
"Add device" button is disabled until the field has a non-whitespace
value.

**Independent Test**: Visit `/profile` as a passkey user — button is
disabled on load; typing a name enables it; clearing the field
disables it again.

### Implementation for User Story 1

- [x] T002 [US1] Change label text from `"Device name (optional)"` to
  `"Device name"` in `src/client/routes/profile.ts`
- [x] T003 [US1] Extend the `disabled` prop on the "Add device" button
  to also check `addDeviceName.value.trim() === ''` in
  `src/client/routes/profile.ts`

**Checkpoint**: Label reads "Device name". Button is disabled on load
and when the field contains only whitespace; enabled otherwise.

---

## Phase 3: User Story 2 - Name Cleared After Submission (Priority: P2)

**Goal**: After a successful invite is created the field is cleared
and the button returns to disabled.

**Independent Test**: Submit an invitation; observe field clears and
button disables.

### Implementation for User Story 2

- [x] T004 [US2] Verify existing `addDeviceName.value = ''` reset in
  `onAddDevice` (line ~111 of `src/client/routes/profile.ts`) already
  satisfies US2 — no code change required; document finding

**Checkpoint**: Post-submission state is correct by construction of
US1 changes — the button disabled condition re-evaluates when the
signal is cleared.

---

## Phase 4: Polish & Verification

- [x] T005 Run `npm test && npm run lint` — 3 pre-existing test
  failures confirmed unchanged; lint has pre-existing missing plugin
- [ ] T006 [P] Manually verify in browser: label text, initial
  disabled state, whitespace-only input stays disabled, valid name
  enables button, post-submit state resets correctly

---

## Dependencies & Execution Order

- **T001** → **T002, T003** (read before edit)
- **T002** and **T003** are independent edits to the same file but
  affect different lines; they can be applied in one pass
- **T004** depends on T002/T003 (verifying US2 behavior after US1
  is in place)
- **T005, T006** depend on all implementation tasks

### Parallel Opportunities

T002 and T003 target different lines; a single editor pass covers
both. T005 and T006 can run in parallel once implementation is done.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. T001 — confirm file contents
2. T002 + T003 — two edits in one pass
3. T005 + T006 — verify

US2 requires no additional code; it is automatically satisfied by the
signal reset that already exists.

### Incremental Delivery

Both user stories are deliverable in a single commit since US2 needs
no code change beyond what US1 provides.

---

## Notes

- No new files, no server changes, no data-model changes.
- Total: 6 tasks across 2 user stories.
- Both stories deliverable in one commit.
