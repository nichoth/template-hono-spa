# Tasks: Serve index.html as a Static File

**Input**: Design documents from `/specs/052-serve-index-html/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/shell-response.md, quickstart.md

**Tests**: Test tasks ARE included. The spec's acceptance scenarios
(US1 #1–#4, US2 #1–#2) and SC-001/SC-002/SC-005 require behavior that
must be enforced by the existing `vitest` + `@cloudflare/vitest-pool-workers`
suite (`test/unit.spec.ts`, `test/integration.spec.ts`). Research §R7
prescribes the exact assertions to add/remove.

**Organization**: Tasks are grouped by user story so each story can be
implemented and validated independently. US1 is the MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Different file from siblings, no dependency on incomplete tasks
- **[Story]**: US1 / US2 — empty for Setup, Foundational, and Polish
- File paths are absolute-from-repo-root unless otherwise noted

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the build artifact this feature depends on actually
exists. No code changes; this gates all later work.

- [X] T001 Run `npm install` and `npm run build`, then verify
      `public/client/index.html` exists and contains content-hashed
      asset URLs (`/assets/index-<hash>.js` and
      `/assets/index-<hash>.css`). Note the current hashes — they're
      referenced by T013 and the quickstart `diff` step.
      Reference: `specs/052-serve-index-html/quickstart.md` step 1,
      research.md §R2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No new foundational infrastructure is needed. The
`ASSETS` Fetcher binding is already configured
(`wrangler.jsonc → assets.directory: ./public/`) and
`formatStartupFailure` already exists in
`src/server/startup-errors.ts`. This phase exists only to record the
invariants that gate later work.

- [X] T002 Confirm `Bindings.ASSETS?:Fetcher` is declared in
      `src/server/index.ts` (line ~21) and that
      `formatStartupFailure({ cause, remediation })` is exported from
      `src/server/startup-errors.ts`. No edits — these are the
      prerequisites US1/US2 depend on.

**Checkpoint**: Foundation ready — US1 and US2 can begin.

---

## Phase 3: User Story 1 — Serve the SPA shell from a real HTML file (Priority: P1) MVP

**Goal**: The Worker returns `public/client/index.html` byte-for-byte
on every shell route. No request-handling code in `src/server/`
constructs HTML by joining or templating string literals.
(Spec FR-001, FR-002, FR-003, FR-007, FR-008; SC-001, SC-002, SC-003.)

**Independent Test**: After `npm run build`, run the Worker
(`npx wrangler dev`) and `diff <(curl -s http://localhost:9999/)
public/client/index.html` — diff is empty. `grep -nE
'<!DOCTYPE|<html|<head>|<body>' src/server/` returns no matches in
request-handling code. Hitting `/profile` returns the same body as
`/`.

### Tests for User Story 1

> Write/adjust tests FIRST. The two existing assertion sets in
> `test/unit.spec.ts:183` ("App shell routes") and
> `test/integration.spec.ts:112` ("App shell") already check
> `<html lang="en">`, "Hono + Preact", and `<div id="root">` — those
> assertions remain valid against the served `public/client/index.html`
> and MUST keep passing. The new tests below add coverage for the
> "served file is the bundled file" claim and for the SC-001 invariant.

- [X] T003 [P] [US1] In `test/integration.spec.ts` "App shell"
      describe block (around line 112), add a test that reads
      `public/client/index.html` from disk and asserts the served
      response body for `GET /` contains the same hashed JS reference
      (`/assets/index-<hash>.js`) that appears in the file. This
      proves the served body is the bundled artifact, not a
      hand-written template. Reference: research.md §R7,
      contracts/shell-response.md "Required body properties".
- [X] T004 [P] [US1] In `test/integration.spec.ts` "App shell"
      describe block, add a test asserting `GET /profile` returns
      a 200 with body byte-equal to the body returned by `GET /`
      (covers spec acceptance scenario US1 #2). Reference:
      contracts/shell-response.md "Scope".
- [X] T005 [P] [US1] In `test/unit.spec.ts` add a new
      "Migration constraints"-style test (near the existing block at
      ~line 834) that fails if any file under `src/server/**/*.ts`
      contains the substrings `<!DOCTYPE`, `<html`, `<head>`, or
      `<body>`. Implement by reading the directory recursively with
      `node:fs` and asserting no matches. Enforces SC-001 in CI.
      Reference: contracts/shell-response.md "Static invariants".

### Implementation for User Story 1

- [X] T006 [US1] In `src/server/index.ts`, add a module-scope
      `let cachedShellHtml:string|null = null` next to the existing
      `let cachedAssets:AssetPaths|null = null` (line 34). This is
      the per-isolate cache documented in research.md §R6 and
      data-model.md "In-isolate cache".
- [X] T007 [US1] In `src/server/index.ts`, add a new private
      `async function fetchShellHtml(c:Context<{ Bindings:Bindings }>)
      :Promise<string>` below `shellPage` (after line 644). Behavior:
      return `cachedShellHtml` if set; otherwise call
      `c.env.ASSETS.fetch(new Request('http://assets/index.html'))`,
      assert the response is OK, read `await response.text()`, store
      in `cachedShellHtml`, and return it. Throw an `Error` with the
      cause strings from research.md §R5 when the binding is missing
      or the response is non-OK (US2 will wire the catch). Reference:
      research.md §R1, §R5.
- [X] T008 [US1] In `src/server/index.ts`, replace the body of
      `async function shellPage(c)` (lines 601–644). Remove the
      `isDev`/`getAssetPaths`/`assets`/HTML-array construction
      entirely. New body:
      `const html = await fetchShellHtml(c); return c.html(html)`
      wrapped in the existing `try`/`catch` that calls
      `formatStartupFailure` and returns `c.text(message, 500)`. The
      `x-startup-prereq-fail` test hook MUST remain so
      `test/unit.spec.ts:819-832` still works (throw inside the
      `try` before the fetch). Reference: research.md §R4, §R5;
      contracts/shell-response.md "Successful response".
- [X] T009 [US1] In `src/server/index.ts`, delete the now-unused
      `getAssetPaths` function (lines 576–599) and the
      `cachedAssets` module-scope cache (line 34). Also delete the
      `import { type AssetPaths, resolveStartupAssets } from
      './startup-assets.js'` line at the top of the file (line 11).
      Reference: research.md §R2 ("manifest code becomes dead").
- [X] T010 [US1] Run `npm test` and confirm
      `test/unit.spec.ts` "App shell routes" (line 183) and
      `test/integration.spec.ts` "App shell" (line 112) pass,
      including T003/T004/T005. Run
      `grep -nE '<!DOCTYPE|<html|<head>|<body>' src/server/` and
      confirm zero matches. Reference: spec SC-001, SC-002.

**Checkpoint**: US1 complete. The MVP is shippable here:
`index.html` is the single source of truth for the served shell, and
no server code constructs HTML.

---

## Phase 4: User Story 2 — Graceful failure when the shell file is unavailable (Priority: P2)

**Goal**: When the bundled `index.html` cannot be loaded, the server
returns a 500 whose body is the existing `formatStartupFailure`
template (cause + remediation), logs a `console.warn` with the same
message, and never crashes. (Spec FR-006; SC-005; US2 acceptance
scenarios #1, #2.)

**Independent Test**: Temporarily move
`public/client/index.html` aside and run `npx wrangler dev`. `curl -i
http://localhost:9999/` returns `HTTP/1.1 500` with a body starting
with `Startup prerequisite error:` and containing `Next step:`. The
Worker logs a matching `console.warn` line. The Worker keeps
serving `/api/health` and `/health` correctly.

### Tests for User Story 2

- [X] T011 [P] [US2] In `test/unit.spec.ts` "App shell routes"
      describe block (line 183), add a test that constructs a
      request env where `ASSETS.fetch` resolves with a 404, then
      asserts: status is 500; body matches
      `/^Startup prerequisite error:.+Next step:.+/`; the cause
      mentions the bundled `index.html`. Use `vi.spyOn(console,
      'warn')` to assert a matching warning was logged. Reference:
      research.md §R5 (table row 2), contracts/shell-response.md
      "Failure response".
- [X] T012 [P] [US2] In `test/unit.spec.ts` "App shell routes"
      describe block, add a test where `c.env.ASSETS` is undefined
      and assert the same 500 / cause+remediation / `console.warn`
      shape. Reference: research.md §R5 (table row 1).
- [X] T013 [P] [US2] In `test/unit.spec.ts` "App shell routes"
      describe block, add a test where `ASSETS.fetch` throws (e.g.
      a stub that rejects with `new Error('boom')`) and assert the
      500 / cause (the thrown message) / remediation / warn shape.
      Reference: research.md §R5 (table row 3).

### Implementation for User Story 2

- [X] T014 [US2] In `src/server/index.ts` `fetchShellHtml`
      (added in T007), throw distinct `Error` instances for the
      three failure modes from research.md §R5:
      - `c.env.ASSETS` undefined → message `"Static asset binding
        is unavailable."`
      - `ASSETS.fetch` resolves non-OK → message ``"Bundled
        `index.html` not found in assets."``
      - `ASSETS.fetch` throws → re-throw with the original
        `error.message`
- [X] T015 [US2] In `src/server/index.ts` `shellPage` `catch`
      block, set the remediation string to ``"Run `npm run build`
      and verify `public/client/index.html` is deployed."`` (overwriting
      today's ``"Check local prerequisites and rerun `npm start`."``).
      Before returning the response, call
      `console.warn(message)` with the same `formatStartupFailure`
      output that becomes the response body. Reference: research.md
      §R5 ("Each failure path: 1. console.warn, 2. c.text(...500)").
- [X] T016 [US2] Run `npm test` and confirm T011, T012, T013, and
      the existing `x-startup-prereq-fail` test
      (`test/unit.spec.ts:819-832`) all pass. Manually run the
      quickstart §6 procedure (rename `public/client/index.html`,
      `npx wrangler dev`, `curl -i /`) to confirm the shaped 500.
      Reference: quickstart.md §6.

**Checkpoint**: US1 + US2 complete. Both shell-success and
shell-missing paths are covered and tested.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Remove the now-dead manifest reader and its tests,
update agent-context docs, run the full quickstart.

- [X] T017 Delete `src/server/startup-assets.ts` (the entire file)
      now that no caller remains. Verify with
      `grep -rn 'startup-assets' src/ test/` returning zero
      remaining imports before deleting. Reference: research.md §R2,
      plan.md "Project Structure" ("CANDIDATE FOR REMOVAL").
- [X] T018 [P] In `test/unit.spec.ts`, delete the
      `resolveStartupAssets` test block (around lines 720–816,
      including the `import { resolveStartupAssets } from
      '../src/server/startup-assets.js'` at line 26–27). Confirm
      `npm test` still passes. Reference: research.md §R7
      ("delete if `src/server/startup-assets.ts` is deleted").
- [X] T019 Run `.specify/scripts/bash/update-agent-context.sh
      claude` to refresh `CLAUDE.md` / `AGENTS.md` "Recent Changes"
      log with this feature. Reference: plan.md "Agent context update".
- [X] T020 Run the full quickstart (`specs/052-serve-index-html/
      quickstart.md` steps 1–7) and confirm every step's expected
      result. Record any deviations. Reference: spec SC-001
      through SC-005.
- [X] T021 Run `npm test && npm run lint` (the project's
      mandated check from `AGENTS.md` §3) and confirm both pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: T001 has no code dependencies. Must precede
  Phase 3 because T003/T013 reference the hashed asset names from the
  built file.
- **Phase 2 (Foundational)**: T002 is a verification-only task; it
  must precede Phase 3 but adds no work.
- **Phase 3 (US1)**: Depends on Phase 1 + 2. MVP boundary.
- **Phase 4 (US2)**: Depends on Phase 3 because T014/T015 modify the
  same `fetchShellHtml` and `shellPage` functions introduced/edited
  in T007/T008. US2 cannot start before US1's edits land.
- **Phase 5 (Polish)**: Depends on Phase 3 (T017 deletes a file
  whose only caller is removed in T009) and Phase 4 (T020 quickstart
  exercises the failure path from US2).

### User Story Dependencies

- **US1 (P1)**: Independent of all other stories. Required for MVP.
- **US2 (P2)**: Touches the same two source-file regions as US1
  (`fetchShellHtml`, `shellPage` catch block), so it sequences
  *after* US1. Independently testable: with US1 in place but US2
  not, the failure-path tests T011–T013 fail and the success-path
  tests pass.

### Within Each User Story

- Tests (T003–T005, T011–T013) are written before the implementation
  tasks they cover and MUST fail before implementation lands.
- Within US1, T006 → T007 → T008 (cache → helper → caller). T009
  (deletion of dead code) runs after T008, before T010 (full test
  run).
- Within US2, T014 → T015 → T016 (helper failure modes → caller
  warn+500 → test run).

### Parallel Opportunities

- T003, T004, T005 all touch different files (or different blocks
  of the same file with no overlap) and can be drafted in parallel
  before the implementation tasks land.
- T011, T012, T013 are sibling test cases in the same describe
  block; they can be authored in parallel (one programmer per case)
  and merged.
- T017 (delete `startup-assets.ts`) and T018 (delete tests for it)
  must be sequenced — T017 first, then T018 — because vitest will
  fail on a missing import if T018 runs first.

---

## Parallel Example: User Story 1 Tests

```bash
# Author the three test additions in parallel:
Task: "T003 — integration test asserting served body contains
       hashed JS ref from public/client/index.html"
Task: "T004 — integration test asserting GET /profile equals GET /"
Task: "T005 — unit test asserting no <!DOCTYPE/<html/<head>/<body>
       in src/server/**/*.ts"
```

## Parallel Example: User Story 2 Tests

```bash
# Author the three failure-mode unit tests in parallel:
Task: "T011 — ASSETS.fetch returns 404 → 500 + warn"
Task: "T012 — ASSETS undefined → 500 + warn"
Task: "T013 — ASSETS.fetch throws → 500 + warn"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 (build + inspect bundled shell).
2. T002 (verify foundational bindings present).
3. T003–T005 (write failing tests for US1).
4. T006–T009 (cache → helper → wire into shellPage → drop dead code).
5. T010 (verify all US1 tests + grep invariant).
6. **STOP and VALIDATE**: run quickstart steps 3–5. The MVP is
   shippable here.

### Incremental Delivery

1. Ship MVP (US1) — single source of truth for the shell achieved.
2. Add US2 (T011–T016) — operational quality of the failure path
   restored.
3. Polish (T017–T021) — remove dead code, refresh agent context,
   final lint+test pass.

### No Parallel Team Strategy

This feature is small (one source file, one test file pair). One
implementer should carry all three phases sequentially. The "parallel"
opportunities above refer only to authoring sibling test cases.

---

## Notes

- [P] tasks operate on different files (or independent test blocks)
  and have no dependency on incomplete sibling tasks.
- The success criterion SC-001 (no inline HTML literals) is enforced
  twice: once by T010's manual `grep`, once by T005 as a CI test.
- The success criterion SC-002 (response body equals
  `public/client/index.html`) is enforced by quickstart §3's `diff`
  and by T003's structural subset check (the manual diff catches
  whitespace drift; the test is robust to changing hashes).
- Do NOT amend commits made in earlier phases — commit after each
  task or each logical group so the bisectable history reflects the
  MVP-first incremental delivery.
- Per `AGENTS.md` §4 ("Do not add new dependencies without asking
  first"), no `package.json` change is in scope for any task.
