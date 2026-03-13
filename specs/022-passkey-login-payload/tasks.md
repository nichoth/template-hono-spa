# Tasks: Passkey Login Request Contract

**Input**: Design documents from `/specs/022-passkey-login-payload/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No separate test-first implementation was requested, but the feature includes contract-validation tasks because the goal is to remove ambiguity from `State.login`.

**Organization**: Tasks are grouped by user story so each story can be completed and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the current login boundary and the files that define it.

- [X] T001 Capture the current client login state boundary in /Users/nick/code/template-hono-spa/src/client/state.ts
- [X] T002 Capture the current passkey login UI boundary in /Users/nick/code/template-hono-spa/src/client/routes/login.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared contract baseline before defining story-specific details.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Confirm the current login API boundary assumptions against /Users/nick/code/template-hono-spa/src/server/index.ts
- [X] T004 [P] Confirm the current login-related validation seams against /Users/nick/code/template-hono-spa/test/unit.spec.ts and /Users/nick/code/template-hono-spa/test/integration.spec.ts
- [X] T005 Document the shared passkey login contract boundary in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/contracts/passkey-login-contract.md

**Checkpoint**: Foundation ready; request, context, and response-definition work can proceed.

---

## Phase 3: User Story 1 - Send the Required Passkey Assertion Data (Priority: P1) 🎯 MVP

**Goal**: Define the exact passkey assertion data the client must send to the server after passkey approval.

**Independent Test**: Review the contract and confirm a developer can list the complete required passkey assertion payload for `State.login` without guessing.

- [X] T006 [US1] Define the required passkey assertion payload fields in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/data-model.md
- [X] T007 [US1] Record the passkey assertion contract and required-field rules in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/contracts/passkey-login-contract.md
- [X] T008 [US1] Align the implementation guidance for `State.login` request construction in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/research.md
- [X] T009 [US1] Document how to validate the required passkey request payload in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/quickstart.md

**Checkpoint**: User Story 1 is complete when the required assertion payload is explicit and reviewable on its own.

---

## Phase 4: User Story 2 - Keep User Identity and Assertion Context Aligned (Priority: P2)

**Goal**: Define the non-assertion context fields that accompany the passkey assertion and explain when they are required.

**Independent Test**: Review the contract and confirm it clearly separates assertion data from identifier, challenge, and correlation context.

- [X] T010 [P] [US2] Define account and challenge-correlation context fields in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/data-model.md
- [X] T011 [P] [US2] Document required versus optional context rules in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/contracts/passkey-login-contract.md
- [X] T012 [US2] Record flow-dependent context decisions for `State.login` in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/research.md
- [X] T013 [US2] Document manual review steps for identifier and challenge context in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/quickstart.md

**Checkpoint**: User Story 2 is complete when the request clearly distinguishes assertion data from surrounding login context.

---

## Phase 5: User Story 3 - Define the Expected Login Response Boundary (Priority: P3)

**Goal**: Define the success and failure responses that `State.login` must understand after sending the passkey login request.

**Independent Test**: Review the contract and confirm the client can distinguish success, rejected assertion, and unusable login-attempt context.

- [X] T014 [P] [US3] Define passkey login response categories in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/data-model.md
- [X] T015 [P] [US3] Document success and failure response rules in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/contracts/passkey-login-contract.md
- [X] T016 [US3] Align `State.login` response-handling guidance in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/research.md
- [X] T017 [US3] Document response-validation review steps in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/quickstart.md

**Checkpoint**: User Story 3 is complete when the response boundary is explicit enough for predictable client state handling.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and task completion across the full contract

- [X] T018 Review the full passkey login contract for consistency across /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/spec.md, /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/data-model.md, and /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/contracts/passkey-login-contract.md
- [X] T019 Mark completed feature tasks and final validation notes in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/tasks.md and /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion; establishes the MVP contract.
- **User Story 2 (Phase 4)**: Depends on the assertion payload baseline from US1.
- **User Story 3 (Phase 5)**: Depends on the finalized request structure from US1 and US2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other user stories.
- **User Story 2 (P2)**: Builds on the request payload from US1.
- **User Story 3 (P3)**: Builds on the final request structure from US1 and US2.

### Parallel Opportunities

- `T003` and `T004` can run in parallel after setup.
- `T010` and `T011` can run in parallel once US1 is complete.
- `T014` and `T015` can run in parallel once US1 and US2 settle the request structure.

---

## Parallel Example: User Story 2

```bash
Task: "Define account and challenge-correlation context fields in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/data-model.md"
Task: "Document required versus optional context rules in /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/contracts/passkey-login-contract.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate that the required passkey assertion payload is explicit before moving on

### Incremental Delivery

1. Define the core assertion payload
2. Add the identifier and challenge-correlation context rules
3. Add the response handling contract for `State.login`
4. Reconcile all contract artifacts for a final implementation-ready handoff

### Parallel Team Strategy

1. One contributor verifies current client and API seams
2. One contributor defines request payload and context rules
3. One contributor tightens response-boundary and review documentation once the request structure stabilizes
