# Tasks: Timing-Safe Basic Auth Comparison

**Input**: Design documents from `/specs/044-timing-safe-basic-auth/`
**Prerequisites**: plan.md, spec.md, research.md

**Organization**: Tasks grouped by user story. US1 and US2 share the same
implementation site (`credentialsMatch`) so the helper is foundational to
both; test tasks are separated per story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no sequential dependency)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Introduce `timingSafeStringEqual` — required by both US1 and US2
before any story test or implementation can be verified.

**Checkpoint**: Helper in place; `credentialsMatch` updated — story test
tasks can now be written and run.

- [X] T001 Add private `timingSafeStringEqual(a, b)` helper using
  `crypto.subtle.timingSafeEqual` and `TextEncoder`, including the
  dummy-comparison branch for differing byte lengths (see research.md
  Decision 2), in `src/server/basic-auth.ts`
- [X] T002 Replace the `===` comparisons in `credentialsMatch` with two
  calls to `timingSafeStringEqual` (once for username, once for password)
  in `src/server/basic-auth.ts`

---

## Phase 2: User Story 1 — Valid Credentials Are Accepted (Priority: P1)

**Goal**: Confirm that an authorized user can still reach the protected
resource after the comparison is swapped.

**Independent Test**: Send a request with correct credentials; the server
must return the requested resource, not a 401.

### Tests for User Story 1

- [X] T003 [US1] Add `describe('credentialsMatch — valid credentials')` block
  to `test/unit.spec.ts` covering:
  - correct username + password → `true`
  - case-sensitive mismatch (same chars, wrong case) → `false`

**Checkpoint**: US1 fully verified — correct credentials are accepted.

---

## Phase 3: User Story 2 — Invalid Credentials Are Rejected (Priority: P1)

**Goal**: Confirm that every invalid-credential variant is still rejected
after the constant-time swap.

**Independent Test**: Requests with wrong password must all receive 401.

### Tests for User Story 2

- [X] T004 [P] [US2] Add `describe('credentialsMatch — invalid credentials')`
  block to `test/unit.spec.ts` covering:
  - correct username, wrong password → `false`
  - wrong username, correct password → `false`
  - both wrong → `false`
  - empty string for username or password → `false`
  - undefined `expectedUsername` → `false`
  - undefined `expectedPassword` → `false`
  - submitted and expected values of differing byte lengths → `false`
- [X] T005 [P] [US2] Add `describe('parseBasicAuthHeader')` block to
  `test/unit.spec.ts` covering malformed and well-formed header inputs
  (FR-006: existing parsing behaviour unchanged)

**Checkpoint**: US1 and US2 both verified independently.

---

## Phase 4: User Story 3 — Timing Does Not Leak Credential Info (Priority: P2)

**Goal**: The constant-time property is in place and reviewable.

**Independent Test**: Code review confirms `crypto.subtle.timingSafeEqual`
is used for all comparisons and no early-return on length occurs before
the dummy call (SC-003). No automated timing test — see research.md
Decision 4.

- [X] T006 [US3] Self-review `timingSafeStringEqual` in
  `src/server/basic-auth.ts` against the checklist in
  `specs/044-timing-safe-basic-auth/checklists/requirements.md`;
  confirm dummy-comparison branch is present and no length early-exit
  precedes it

**Checkpoint**: Timing-safe property confirmed by code review.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T007 Run `npm test && npm run lint` and confirm all tests pass with no
  new lint errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on T001 + T002
- **US2 (Phase 3)**: Depends on T001 + T002; T004 and T005 are independent
  of each other [P]
- **US3 (Phase 4)**: Depends on T001 + T002
- **Polish (Phase 5)**: Depends on all story phases

### Parallel Opportunities

- T004 and T005 (both Phase 3) operate on separate `describe` blocks in the
  same file but can be drafted in parallel and merged before running

---

## Parallel Example: Phase 3

```bash
# These two test-describe blocks can be drafted simultaneously:
Task T004: credentialsMatch invalid-credentials tests in test/unit.spec.ts
Task T005: parseBasicAuthHeader tests in test/unit.spec.ts
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 (T001, T002) — helper + credentialsMatch update
2. Complete Phase 2 (T003) — US1 verified
3. **STOP and VALIDATE**: `npm test` passes for US1 scenarios

### Incremental Delivery

1. T001 → T002: constant-time function in place
2. T003: US1 green
3. T004 + T005 (parallel): US2 green
4. T006: US3 confirmed by review
5. T007: full suite clean

---

## Notes

- [P] = different `describe` blocks; no sequential file-write dependency
- No new files — changes are confined to `src/server/basic-auth.ts` and
  `test/unit.spec.ts`
- Lines <= 80 columns; no emojis; TypeScript ESM style per CLAUDE.md
- `timingSafeStringEqual` is private (not exported) — YAGNI per research.md
  Decision 3
