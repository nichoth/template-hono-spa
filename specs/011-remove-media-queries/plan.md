# Implementation Plan: Adaptive Layout Without Media Queries

**Branch**: `011-remove-media-queries` | **Date**: 2026-03-11 | **Spec**: [/Users/nick/code/template-hono-spa/specs/011-remove-media-queries/spec.md](/Users/nick/code/template-hono-spa/specs/011-remove-media-queries/spec.md)
**Input**: Feature specification from `/specs/011-remove-media-queries/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace breakpoint-driven layout behavior with intrinsic CSS Grid and fluid sizing so the application shell adapts continuously across viewport sizes without media queries, while preserving readability, navigation access, and stable behavior under long content and zoom.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode), CSS  
**Primary Dependencies**: Preact, route-event, Hono, Vite, `@substrate-system/*` style packages  
**Storage**: N/A  
**Testing**: Vitest (`npm test`), ESLint (`npm run lint`), manual viewport matrix checks  
**Target Platform**: Browser-based SPA served by Hono/Cloudflare Worker tooling  
**Project Type**: Web application (SPA client + Worker backend)  
**Performance Goals**: Maintain existing lightweight rendering profile while preventing layout regressions across 320px-1920px widths  
**Constraints**: No media queries for this feature; rely on intrinsic layout behavior using grid and fluid units; keep existing app navigation and route behavior unchanged  
**Scale/Scope**: CSS/layout updates for primary app shell pages and shared layout components (home cards grid, nav shell, main content flow)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file status: `/Users/nick/code/template-hono-spa/.specify/memory/constitution.md` is a placeholder template with no enforceable principles.
- Pre-Phase-0 gate result: PASS (no active constitutional constraints to violate).
- Post-Phase-1 gate result: PASS (research and design artifacts do not conflict with any active constitutional rule set).

## Project Structure

### Documentation (this feature)

```text
/Users/nick/code/template-hono-spa/specs/011-remove-media-queries/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── adaptive-layout-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/nick/code/template-hono-spa/src/
├── style.css
├── client/
│   ├── components/
│   │   └── nav.css
│   └── routes/
│       └── home.css
└── app.ts

/Users/nick/code/template-hono-spa/test/
├── integration.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Keep the existing single-project structure and implement adaptive behavior in existing CSS files used by the SPA shell, with verification through existing test/lint commands plus manual viewport checks.

### Implementation Touchpoints Confirmed

- Shared tokens and base layout constraints: `/Users/nick/code/template-hono-spa/src/style.css`
- Home route adaptive card grid: `/Users/nick/code/template-hono-spa/src/client/routes/home.css`
- Navigation intrinsic wrapping and alignment: `/Users/nick/code/template-hono-spa/src/client/components/nav.css`
- Card long-content safeguards: `/Users/nick/code/template-hono-spa/src/client/components/card.css`
- Validation notes and execution guidance: `/Users/nick/code/template-hono-spa/specs/011-remove-media-queries/quickstart.md`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified.
