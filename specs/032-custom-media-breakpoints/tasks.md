---
description: "Task list for referencing custom media variables in header CSS"
---

# Tasks: Custom media breakpoint usage

**Input**: Design docs from `/specs/032-custom-media-breakpoints/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)  
**Prerequisites**: Ensure branch `032-custom-media-breakpoints` is checked out and `npm install` has run  
**Tests**: Vitest suite (`npm test`) covering CSS source verification  
**Organization**: Tasks grouped by user story so each change is independently testable

## Phase 1: Setup (Shared infrastructure)

**Purpose**: Confirm the `--small` custom media variable exists and is referenced correctly from `src/_variables.css`.

- [X] T001 [P] Review `src/_variables.css` to confirm `--small` maps to `(width <= 680px)` and document this breakpoint in `specs/032-custom-media-breakpoints/quickstart.md`.
- [X] T002 [P] Leave any additional custom media definitions untouched so the pipeline can still transpile them via LightningCSS.

---

## Phase 2: Foundational (Blocking prerequisites)

**Purpose**: Prepare `src/style.css` to reference the shared breakpoint variable without touching other selectors.

- [X] T003 Replace the existing `@media (max-width: 679px)` in `src/style.css` with `@media (--small)` while preserving the surrounding header styling block.

---

## Phase 3: User Story 1 - Use custom breakpoint variable (Priority: P1) 🎯 MVP

**Goal**: Hide the `.login-status` text on small screens via the shared `--small` media definition.

**Independent Test**: Resize the browser below the small breakpoint and confirm `.login-status` hides; verifying the CSS now uses `@media (--small)`.

### Implementation for User Story 1

- [X] T004 [US1] Ensure the `.login-status` rule stays inside the header styles and is wrapped in the new custom media expression so responsive behavior is unchanged.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Update documentation and CI verification to reflect the CSS change.

- [X] T005 Update `specs/032-custom-media-breakpoints/quickstart.md` to describe verifying the custom media usage.
- [X] T006 [P] Run `npm test` to confirm the Vitest suite passes after the media query update.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; confirm custom media definitions first.
- **Foundational (Phase 2)**: Depends on Setup to ensure the variable exists before referencing it.
- **User Story (Phase 3)**: Depends on the Foundational change; there is only one story.
- **Polish (Phase 4)**: Depends on all prior tasks for documentation/tests.

### User Story Graph

```
Phase 2 -> US1 -> Phase 4
```

## Parallel Execution Examples

- T001 and T002 can run together because they only touch `src/_variables.css` and documentation.
- T003 (CSS change) and T005 (quickstart update) can run in parallel since they edit different files.
- T006 (`npm test`) can run after the code changes finish; it can run concurrently with documentation updates if desired.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Confirm `--small` exists in `_variables.css`.
2. Update `src/style.css` to wrap `.login-status` in `@media (--small)`.
3. Validate manually and via the quickstart steps before any additional polish.

### Incremental Delivery

1. Once MVP is verified, update quickstart instructions to mention the custom media change.
2. Run `npm test` to ensure CSS checks pass.
