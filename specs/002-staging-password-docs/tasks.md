# Tasks: Staging Password Docs

**Input**: Design documents from `/Users/nick/code/template-hono-spa/specs/002-staging-password-docs/`
**Prerequisites**: [plan.md](/Users/nick/code/template-hono-spa/specs/002-staging-password-docs/plan.md), [spec.md](/Users/nick/code/template-hono-spa/specs/002-staging-password-docs/spec.md), [research.md](/Users/nick/code/template-hono-spa/specs/002-staging-password-docs/research.md), [data-model.md](/Users/nick/code/template-hono-spa/specs/002-staging-password-docs/data-model.md), [staging-password-docs-contract.md](/Users/nick/code/template-hono-spa/specs/002-staging-password-docs/contracts/staging-password-docs-contract.md), [quickstart.md](/Users/nick/code/template-hono-spa/specs/002-staging-password-docs/quickstart.md)

**Tests**: No new automated tests are required. Validation for this feature is documentation review against existing repository configuration plus standard repository validation commands.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each documentation outcome.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (for example `US1`, `US2`, `US3`)
- Each task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Gather the current staging-auth references that the README update must match.

- [X] T001 [P] Review the existing staging deployment and secret references in /Users/nick/code/template-hono-spa/wrangler.jsonc
- [X] T002 [P] Review the current README structure and placement for deployment guidance in /Users/nick/code/template-hono-spa/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the documentation shape and guardrails before editing the README.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Consolidate the required staging credential names, deployment scope, and rotation guidance in /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/research.md
- [X] T004 [P] Confirm the documentation contract for required README coverage in /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/contracts/staging-password-docs-contract.md
- [X] T005 [P] Confirm the manual validation flow for the README update in /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/quickstart.md

**Checkpoint**: The required documentation content and validation criteria are fixed

---

## Phase 3: User Story 1 - Configure staging protection (Priority: P1) 🎯 MVP

**Goal**: Add README guidance that explains how maintainers configure staging password protection with the correct staging secret names and environment context.

**Independent Test**: Open `/Users/nick/code/template-hono-spa/README.md` and verify it explains the staging-only deployment context plus the exact secret names without needing source-file lookup.

### Implementation for User Story 1

- [X] T006 [US1] Add a staging deployment protection section to /Users/nick/code/template-hono-spa/README.md
- [X] T007 [US1] Document the exact staging secret names and staging environment application steps in /Users/nick/code/template-hono-spa/README.md
- [X] T008 [US1] Review /Users/nick/code/template-hono-spa/README.md against /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/contracts/staging-password-docs-contract.md for staging setup completeness

**Checkpoint**: Maintainers can configure staging protection from README.md alone

---

## Phase 4: User Story 2 - Generate a secure password from the CLI (Priority: P2)

**Goal**: Add a CLI example that maintainers can use to generate a strong random staging password.

**Independent Test**: Open `/Users/nick/code/template-hono-spa/README.md` and verify it includes a copyable CLI password-generation example suitable for staging setup.

### Implementation for User Story 2

- [X] T009 [US2] Add a CLI random-password generation example to /Users/nick/code/template-hono-spa/README.md
- [X] T010 [US2] Clarify how the generated password value maps to the staging password secret in /Users/nick/code/template-hono-spa/README.md
- [X] T011 [US2] Review /Users/nick/code/template-hono-spa/README.md to ensure the CLI example does not imply a checked-in default password is acceptable

**Checkpoint**: Maintainers can generate and apply a staging password from the README guidance

---

## Phase 5: User Story 3 - Update staging credentials safely (Priority: P3)

**Goal**: Explain how maintainers rotate the staging password later without ambiguity about what to replace.

**Independent Test**: Open `/Users/nick/code/template-hono-spa/README.md` and verify it describes which staging credential to update during password rotation and where it applies.

### Implementation for User Story 3

- [X] T012 [US3] Add staging password rotation guidance to /Users/nick/code/template-hono-spa/README.md
- [X] T013 [US3] Clarify whether username rotation is separate from password rotation in /Users/nick/code/template-hono-spa/README.md
- [X] T014 [US3] Review the final rotation guidance in /Users/nick/code/template-hono-spa/README.md against /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/spec.md

**Checkpoint**: Maintainers can identify how to rotate staging credentials safely from README.md

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation quality checks

- [X] T015 Run the manual documentation validation flow in /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/quickstart.md
- [X] T016 Run repository validation with `npm run lint` and `HOME=/tmp npm test`, then record notable outcomes in /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 because the password-generation example must map to the documented staging setup
- **User Story 3 (Phase 5)**: Depends on User Story 1 because rotation guidance extends the staging secret setup instructions
- **Polish (Phase 6)**: Depends on all user stories completing

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational and is the recommended MVP slice
- **US2 (P2)**: Starts after US1 because it builds on the staging secret setup instructions
- **US3 (P3)**: Starts after US1 and can follow US2 sequentially for a single-editor workflow

### Within Each User Story

- Core README content should be written before review tasks
- Story-specific review should complete before moving to the next priority
- Each story should remain understandable when read directly in README.md

### Parallel Opportunities

- `T001` and `T002` can run in parallel during Setup
- `T004` and `T005` can run in parallel during Foundational

---

## Parallel Example: Setup

```bash
Task: "Review the existing staging deployment and secret references in /Users/nick/code/template-hono-spa/wrangler.jsonc"
Task: "Review the current README structure and placement for deployment guidance in /Users/nick/code/template-hono-spa/README.md"
```

## Parallel Example: Foundational

```bash
Task: "Confirm the documentation contract for required README coverage in /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/contracts/staging-password-docs-contract.md"
Task: "Confirm the manual validation flow for the README update in /Users/nick/code/template-hono-spa/specs/002-staging-password-docs/quickstart.md"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate that README.md alone explains staging protection setup

### Incremental Delivery

1. Deliver US1 so maintainers can configure staging protection from README.md
2. Add US2 so maintainers can generate a secure password without leaving the docs
3. Add US3 so maintainers can rotate staging credentials safely
4. Finish with manual documentation review and standard repo validation

### Suggested MVP Scope

- **MVP**: User Story 1 only
- **Why**: It delivers the core operational value by documenting the staging setup path and required secret names
