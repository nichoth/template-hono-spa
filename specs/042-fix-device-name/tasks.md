# Tasks: Fix Device Name Bug

**Input**: Design documents from `/specs/042-fix-device-name/`
**Prerequisites**: plan.md, spec.md, research.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project restructuring needed — this is a targeted bug fix.
No new files, no schema migrations.

- [x] T001 Verify test suite passes before changes (`npm test`)
  Note: Pre-existing failures discovered and resolved:
  - vitest.config.ts updated for @cloudflare/vitest-pool-workers 0.13.0
  - esbuild 0.27.4 bug with `as const` on new line fixed in test file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Understand the exact lines to change before touching code.

- [x] T002 Read `src/client/routes/profile.ts` lines 340-360 to locate the
  `SubstrateInput` missing its `onInput` handler
- [x] T003 Read `test/integration.spec.ts` lines 1290-1340 to locate the
  existing device invitation test and find insertion point for new tests

---

## Phase 3: User Story 1 - Named Device Invitation (Priority: P1) MVP

**Goal**: Entering a device name in the form creates an invitation with that
name, not "Unnamed".

**Independent Test**: Enter "My Laptop" in the Device name field, click
"Add device", verify the pending invitation shows "My Laptop".

### Tests for User Story 1

- [x] T004 [US1] Add integration test: `createDeviceInvitation` with name
  "My Laptop" returns `deviceName === 'My Laptop'` and
  `listDeviceInvitations` returns the invitation with that name —
  in `test/integration.spec.ts`
- [x] T005 [P] [US1] Add integration test: `createDeviceInvitation` without
  a name returns `deviceName` as null/undefined —
  in `test/integration.spec.ts`

### Implementation for User Story 1

- [x] T006 [US1] Add `onInput` handler to `SubstrateInput` to update
  `addDeviceName` signal on each keystroke —
  in `src/client/routes/profile.ts` (the `SubstrateInput` block around
  line 346)

**Checkpoint**: `npm test` — 38 tests pass. New tests pass. Pre-existing
failures (2 Device revocation tests, 1 session-expiration timezone test,
1 unit.spec.ts web-component error) confirmed pre-existing.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T007 Run full test suite and confirm all tests pass (`npm test`)
  Note: `npm run lint` blocked by pre-existing missing `eslint-plugin-import`
  package (unrelated to this feature)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1
- **Phase 3 (US1)**: Depends on Phase 2 — tests (T004, T005) written first,
  then fix (T006)
- **Phase 4 (Polish)**: Depends on Phase 3

### User Story Dependencies

- **User Story 1 (P1)**: Only story — no cross-story dependencies

### Within User Story 1

- T004 and T005 (tests) MUST be written and confirmed to fail before T006
- T006 (fix) makes T004 and T005 pass

### Parallel Opportunities

- T004 and T005 can be written in parallel (different test cases, same file
  section is fine as long as they don't conflict)

---

## Parallel Example: User Story 1

```bash
# Write both test cases together:
Task T004: named invitation test in test/integration.spec.ts
Task T005: unnamed invitation test in test/integration.spec.ts

# Then implement the fix:
Task T006: add onInput handler in src/client/routes/profile.ts
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Phase 1: Confirm baseline tests pass
2. Phase 2: Read targeted files
3. Phase 3: Write tests (T004, T005) → confirm they fail → apply fix (T006)
   → confirm tests pass
4. Phase 4: Full lint + test run

Total: 7 tasks, ~30 minutes of work.

---

## Notes

- [P] tasks = different concerns, no file conflicts
- T004/T005 test the server-side path (already correct) as regression guards
- T006 is the only production code change
- Do NOT change server-side code, API routes, or DB schema
