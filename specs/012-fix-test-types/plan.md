# Implementation Plan: Fix Test File Type Errors

**Branch**: `012-fix-test-types` | **Date**: 2026-03-11 | **Spec**: [/Users/nick/code/template-hono-spa/specs/012-fix-test-types/spec.md](/Users/nick/code/template-hono-spa/specs/012-fix-test-types/spec.md)
**Input**: Feature specification from `/specs/012-fix-test-types/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Eliminate TypeScript diagnostics originating from the repository's three existing test files by aligning the test typing setup with the installed Cloudflare Workers Vitest integration and updating outdated test call sites. Keep the scope narrow by using a test-focused validation path and only changing non-test files when they directly support test-file typing.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript ES2022 in strict mode  
**Primary Dependencies**: Vitest 3.2, `@cloudflare/vitest-pool-workers`, `@cloudflare/workers-types`, Vite 7, Hono, Preact  
**Storage**: N/A  
**Testing**: Vitest worker tests plus TypeScript validation via `tsc --noEmit`  
**Target Platform**: Node.js development environment with Cloudflare Workers runtime bindings
**Project Type**: Web application with Cloudflare Worker backend and Preact client  
**Performance Goals**: Preserve the current local test feedback loop; no user-facing runtime performance change  
**Constraints**: Fix all type errors in `test/`; preserve current test intent; keep non-test changes minimal; document unrelated non-test diagnostics rather than broadening scope  
**Scale/Scope**: 3 existing test files in `test/`, plus any minimal shared typing or configuration files required to validate them

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pre-Phase 0 gate status: PASS

- The constitution file at `.specify/memory/constitution.md` is still an unfilled template and does not define enforceable project-specific rules.
- No `NEEDS CLARIFICATION` markers remain in the feature spec.
- The planned work stays within the user-requested scope: test-file typing plus minimal supporting changes.
- No new runtime interfaces or persistent storage are introduced.

Post-Phase 1 re-check: PASS

- Research resolves the typing unknowns without adding new dependencies.
- The design keeps verification centered on test-file diagnostics and existing test execution.
- Any unrelated repository diagnostics remain documented as out of scope unless they block the targeted validation path.

## Project Structure

### Documentation (this feature)

```text
specs/012-fix-test-types/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/
│   └── test-type-validation.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app.ts
├── client/
│   ├── components/
│   ├── routes/
│   └── state.ts
└── server/
    ├── index.ts
    ├── startup-assets.ts
    └── startup-errors.ts

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts

vitest.config.ts
tsconfig.json
wrangler.test.jsonc
```

**Structure Decision**: Use the existing single-repository web application layout. The implementation will primarily touch `test/` and TypeScript configuration, with narrowly scoped support changes in `src/` only if imported test dependencies still emit required diagnostics.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
