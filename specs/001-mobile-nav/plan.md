# Implementation Plan: Mobile Navigation

**Branch**: `001-mobile-nav` | **Date**: 2026-03-12 | **Spec**: [/Users/nick/code/template-hono-spa/specs/001-mobile-nav/spec.md](/Users/nick/code/template-hono-spa/specs/001-mobile-nav/spec.md)
**Input**: Feature specification from `/specs/001-mobile-nav/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a responsive mobile navigation pattern that moves primary links into a top-right header menu on small screens while preserving the current inline navigation on larger screens. The implementation will extend the shared nav component and styles, register the installed hamburger web component in the existing client bootstrap, and add route/header coverage to protect both mobile and desktop navigation behavior.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode) and CSS  
**Primary Dependencies**: Preact, `htm/preact`, `@preact/signals`, Hono, Vite, `@substrate-system/routes`, `@substrate-system/hamburger-two`  
**Storage**: N/A  
**Testing**: Vitest 3 with `@cloudflare/vitest-pool-workers`, plus ESLint  
**Target Platform**: Browser-based SPA served by a Cloudflare Worker and local Vite dev server  
**Project Type**: web application  
**Performance Goals**: Mobile navigation should open and close within the normal client interaction cycle and preserve the existing lightweight header behavior  
**Constraints**: Keep desktop inline navigation, move primary links into a mobile-only menu on compact screens, place the menu trigger in the top-right header area, avoid duplicate nav presentations, and use the already-installed hamburger web component according to its documented open/close event model  
**Scale/Scope**: Shared header/nav component updates, responsive navigation styles, client bootstrap registration for the hamburger element, and focused unit/integration coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is still an unfilled placeholder template, so it provides no enforceable project-specific gates.
- Planning gate status: PASS by default because there are no ratified constitutional rules to evaluate against.
- Operational quality gates still apply:
  - Preserve existing larger-screen navigation behavior.
  - Keep the feature scoped to navigation presentation rather than changing route definitions.
  - Validate with `npm run lint` and `HOME=/tmp npm test`.
- Post-design re-check: PASS. The design stays within the documented mobile-navigation scope and introduces no constitutional conflicts.

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-nav/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── mobile-nav-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── index.ts
│   ├── state.ts
│   ├── components/
│   │   ├── nav.ts
│   │   └── nav.css
│   └── routes/
│       └── index.ts
├── style.css
└── server/
    └── index.ts

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Keep the existing single-project web app structure. The feature is isolated to the shared header navigation layer, shared stylesheet imports, and the existing unit/integration test files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
