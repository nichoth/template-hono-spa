# Implementation Plan: Vite 8 Config Compatibility

**Branch**: `021-vite8-config` | **Date**: 2026-03-13 | **Spec**: [/Users/nick/code/template-hono-spa/specs/021-vite8-config/spec.md](/Users/nick/code/template-hono-spa/specs/021-vite8-config/spec.md)
**Input**: Feature specification from `/specs/021-vite8-config/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Adjust the project’s Vite configuration so the repository runs cleanly on Vite 8 without breaking the current development server, build output, or Cloudflare/Hono app-shell flow. The implementation will keep the existing single-project structure, narrow changes to configuration and validation seams, and add regression coverage around the dev/build paths most likely to break when config options or plugin expectations change across the Vite upgrade.

## Technical Context

**Language/Version**: TypeScript (ESM, ES2022 strict mode), JavaScript config files, CSS  
**Primary Dependencies**: Vite 8, Vitest 3, Hono, Preact, `@cloudflare/vite-plugin`, `@hono/vite-dev-server`, Lightning CSS, Browserslist  
**Storage**: Filesystem build output only (`public/`, generated manifest)  
**Testing**: Vitest worker tests, ESLint, existing `npm start` and `npm run build` workflows  
**Target Platform**: Browser SPA with local Vite dev server and Cloudflare Worker-compatible runtime/build flow  
**Project Type**: web application  
**Performance Goals**: Preserve current startup and build completion behavior with no new configuration-related failures or extra manual setup steps  
**Constraints**: Keep the scope limited to Vite 8 compatibility, preserve the current dev server entry point and build output shape, avoid unrelated dependency upgrades unless directly required by configuration compatibility, and retain existing route and asset behavior  
**Scale/Scope**: One primary config file (`vite.config.js`), package scripts that exercise it, existing worker/dev-server integration, and targeted regression coverage for startup/build compatibility

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) remains an unfilled template with placeholder sections and no ratified repository-specific rules.
- Planning gate status: PASS by default because there are no enforceable constitutional requirements defined yet.
- Operational repository gates still apply for implementation:
  - Keep the work bounded to Vite 8 compatibility in configuration, validation, and related docs/tests.
  - Preserve existing `npm start`, `npm run build`, `npm run lint`, and `HOME=/tmp npm test` workflows as the baseline user entry points.
  - Avoid unrelated runtime behavior changes outside what is necessary to satisfy the upgraded config contract.
- Post-design re-check: PASS. Phase 0 and Phase 1 artifacts stay within the configuration-compatibility boundary and do not introduce additional governance concerns.

## Project Structure

### Documentation (this feature)

```text
specs/021-vite8-config/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── vite8-config-contract.md
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
wrangler.test.jsonc
```

**Structure Decision**: Keep the existing single-project web application layout. This feature is centered on the repository-root Vite configuration and the existing test/build entry points that validate it.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
