# Implementation Plan: Vite Dependency Optimization Warning Fix

**Branch**: `027-fix-vite-config` | **Date**: 2026-03-13 | **Spec**: [/Users/nick/code/template-hono-spa/specs/027-fix-vite-config/spec.md](/Users/nick/code/template-hono-spa/specs/027-fix-vite-config/spec.md)
**Input**: Feature specification from `/specs/027-fix-vite-config/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Adjust the repository's Vite configuration so `npm start` no longer emits the dependency-optimization deprecation warning about `optimizeDeps.esbuildOptions`, while preserving the existing dev-server startup flow, local route availability, and maintainability of the config surface. The implementation will stay focused on `vite.config.js`, related script expectations, and targeted regression coverage that proves startup remains clean and behaviorally unchanged.

## Technical Context

**Language/Version**: TypeScript (ESM, ES2022 strict mode), JavaScript config files, CSS  
**Primary Dependencies**: Vite 8, Vitest 3, Hono, Preact, `@cloudflare/vite-plugin`, `@hono/vite-dev-server`, Lightning CSS, Browserslist  
**Storage**: N/A for runtime data; filesystem build output under `public/`  
**Testing**: Vitest, ESLint, `npm start` startup verification, existing package-script workflow  
**Target Platform**: Browser SPA served by local Vite dev server with Cloudflare Worker-compatible build/runtime flow  
**Project Type**: web application  
**Performance Goals**: Preserve existing startup time and route availability while eliminating the reported deprecation warning from standard local startup  
**Constraints**: Keep scope limited to the dependency-optimization warning, do not change the `npm start` entry point, avoid unrelated dependency churn, and preserve current route/asset behavior during local development  
**Scale/Scope**: One primary config file (`vite.config.js`), package scripts in `package.json`, and focused regression coverage in the existing `test/` suite

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is still an unfilled placeholder template, so there are no enforceable repository-specific constitutional gates.
- Planning gate status: PASS by default because no ratified rules are defined yet.
- Operational constraints that still govern this feature:
  - Keep changes narrowly scoped to the warning reported during `npm start`.
  - Preserve the existing local startup command and observable dev-server behavior.
  - Validate through the repository's established commands rather than one-off temporary scripts.
- Post-design re-check: PASS. The design artifacts remain inside the intended configuration-compatibility boundary and do not require any justified complexity exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/027-fix-vite-config/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── vite-optimize-deps-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
├── server/
├── style.css
└── app.ts

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts

vite.config.js
vitest.config.ts
package.json
```

**Structure Decision**: Keep the existing single-project web application layout. This feature is centered on the repository-root Vite configuration and the current script/test entry points that define acceptable startup behavior.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
