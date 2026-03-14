# Tasks: Square Home Cards

**Input**: Design documents from `/specs/025-square-cards/`
**Prerequisites**: `/Users/nick/code/template-hono-spa/specs/025-square-cards/plan.md`, `/Users/nick/code/template-hono-spa/specs/025-square-cards/spec.md`, `/Users/nick/code/template-hono-spa/specs/025-square-cards/research.md`, `/Users/nick/code/template-hono-spa/specs/025-square-cards/data-model.md`, `/Users/nick/code/template-hono-spa/specs/025-square-cards/contracts/home-layout.md`

**Tests**: Include targeted Vitest source-level assertions in `/Users/nick/code/template-hono-spa/test/unit.spec.ts` because the feature spec defines independent verification criteria and the plan explicitly scopes automated coverage there.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing home-route files for focused layout work without broadening scope.

- [X] T001 Confirm the home card layout contract comments and target files in `/Users/nick/code/template-hono-spa/specs/025-square-cards/plan.md`, `/Users/nick/code/template-hono-spa/specs/025-square-cards/contracts/home-layout.md`, and `/Users/nick/code/template-hono-spa/specs/025-square-cards/quickstart.md`
- [X] T002 [P] Add or reserve a dedicated `describe` block for home card layout assertions in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the route-level hooks and CSS boundaries that every story depends on.

**⚠️ CRITICAL**: No user story work should start until these tasks are complete.

- [X] T003 Add any required home-route wrapper or class hook for a scrollable card viewport in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- [X] T004 [P] Define the base home grid viewport/container selectors that all stories build on in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`

**Checkpoint**: Home route markup and CSS boundaries are ready for story-specific layout work.

---

## Phase 3: User Story 1 - Single Card Feels Square (Priority: P1) 🎯 MVP

**Goal**: Make home cards prefer a square footprint in narrow or single-card presentations without clipping content.

**Independent Test**: Open the home page in a narrow/mobile viewport and confirm each card appears close to square without excessive vertical empty space.

### Tests for User Story 1

- [X] T005 [P] [US1] Add failing Vitest assertions for square-preferred home card sizing in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

### Implementation for User Story 1

- [X] T006 [US1] Implement square-preferred sizing for home cards in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`
- [X] T007 [US1] Adjust shared card layout behavior so square-preferred cards can still grow vertically in `/Users/nick/code/template-hono-spa/src/client/components/card.css`

**Checkpoint**: Single-card layouts render with a square preference while preserving readable content.

---

## Phase 4: User Story 2 - Multi-Card Rows Stay Even (Priority: P1)

**Goal**: Keep the home cards in one even three-card row at the reference desktop size and allow horizontal overflow when that row cannot fit.

**Independent Test**: Open the home page in a wide viewport where multiple cards render on the same row and confirm all cards in that row share the same height.

### Tests for User Story 2

- [X] T008 [P] [US2] Add failing Vitest assertions for a three-column home row with horizontal overflow support in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

### Implementation for User Story 2

- [X] T009 [US2] Update the home route card container structure for a scrollable three-card row in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`
- [X] T010 [US2] Implement the three-column scrollable grid and equal-height row behavior in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`

**Checkpoint**: The desktop home route prefers a single even row of three cards and scrolls horizontally instead of collapsing into tall cards.

---

## Phase 5: User Story 3 - Card Content Remains Readable (Priority: P2)

**Goal**: Keep headings, controls, and dynamic response output readable and usable after the square-card layout change.

**Independent Test**: Open the home page, verify the counter controls and fetch/error card remain usable, and confirm no card content overlaps, clips unexpectedly, or becomes inaccessible.

### Tests for User Story 3

- [X] T011 [P] [US3] Add failing Vitest assertions for readable fetcher output and control containment in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`

### Implementation for User Story 3

- [X] T012 [US3] Tune fetcher-card content flow and `pre` overflow behavior in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`
- [X] T013 [US3] Refine shared card spacing and containment for buttons, headings, and dynamic content in `/Users/nick/code/template-hono-spa/src/client/components/card.css`

**Checkpoint**: Interactive controls and dynamic content stay readable after the new layout lands.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full feature across automated and manual checks.

- [X] T014 Run `npm test` and fix any resulting regressions in `/Users/nick/code/template-hono-spa/test/unit.spec.ts`, `/Users/nick/code/template-hono-spa/src/client/routes/home.css`, `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`, and `/Users/nick/code/template-hono-spa/src/client/components/card.css`
- [X] T015 Run `npm run lint` and resolve any lint violations in `/Users/nick/code/template-hono-spa/src/client/routes/home.ts`, `/Users/nick/code/template-hono-spa/test/unit.spec.ts`, and `/Users/nick/code/template-hono-spa/src/client/components/card.css`
- [X] T016 Execute the manual verification flow in `/Users/nick/code/template-hono-spa/specs/025-square-cards/quickstart.md` and update `/Users/nick/code/template-hono-spa/specs/025-square-cards/quickstart.md` if any verification step needs clarification

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 blocks all user story work because it establishes the route markup and CSS boundaries.
- Phase 3 delivers the MVP and should complete before later stories.
- Phase 4 depends on Phase 3 because the three-column row builds on the square-card sizing rules.
- Phase 5 depends on Phase 4 because readability tuning should validate the final row and overflow behavior.
- Phase 6 depends on all implementation phases being complete.

### User Story Dependencies

- **US1**: Starts after Phase 2 and has no dependency on other user stories.
- **US2**: Starts after US1 because it extends the same home route and stylesheet to the three-card desktop layout.
- **US3**: Starts after US2 because readability tuning should target the finished square-and-scroll layout.

### Parallel Opportunities

- `T002` can run in parallel with `T001` because it touches only `/Users/nick/code/template-hono-spa/test/unit.spec.ts`.
- `T004` can run in parallel with `T003` because it stays in `/Users/nick/code/template-hono-spa/src/client/routes/home.css`.
- Within each story, the failing-test task can be prepared before implementation work starts because it touches only `/Users/nick/code/template-hono-spa/test/unit.spec.ts`.

---

## Parallel Example: User Story 1

```bash
Task: "Add failing Vitest assertions for square-preferred home card sizing in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Review current shared card constraints in /Users/nick/code/template-hono-spa/src/client/components/card.css before applying the US1 sizing change"
```

## Parallel Example: User Story 2

```bash
Task: "Add failing Vitest assertions for a three-column home row with horizontal overflow support in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Review the existing card container markup in /Users/nick/code/template-hono-spa/src/client/routes/home.ts for the scrollable row update"
```

## Parallel Example: User Story 3

```bash
Task: "Add failing Vitest assertions for readable fetcher output and control containment in /Users/nick/code/template-hono-spa/test/unit.spec.ts"
Task: "Review current fetcher and preformatted content rules in /Users/nick/code/template-hono-spa/src/client/routes/home.css before final readability tuning"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for US1.
3. Validate US1 independently in a narrow viewport.
4. Stop if the square-card MVP is sufficient.

### Incremental Delivery

1. Deliver US1 to establish square-preferred cards.
2. Add US2 to lock the three-card desktop row and overflow behavior.
3. Add US3 to harden readability for dynamic content and controls.
4. Finish with automated and manual verification in Phase 6.
