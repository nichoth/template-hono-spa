# Implementation Plan: Shared Color Variables

**Branch**: `016-css-color-vars` | **Date**: 2026-03-12 | **Spec**: [/Users/nick/code/template-hono-spa/specs/016-css-color-vars/spec.md](/Users/nick/code/template-hono-spa/specs/016-css-color-vars/spec.md)
**Input**: Feature specification from `/specs/016-css-color-vars/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Standardize all maintained UI colors behind shared CSS variables so the SPA uses one semantic color source across global styles, route styles, and shared components. The implementation will extend the existing root color token set, replace remaining hard-coded color literals in maintained CSS, and add focused regression coverage that protects the no-literals rule and existing visual semantics.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode) and CSS  
**Primary Dependencies**: Preact, Hono, Vite 7, `route-event`, `@substrate-system/*` UI packages, Lightning CSS custom-media support  
**Storage**: N/A  
**Testing**: Vitest 3, TypeScript typecheck, ESLint  
**Target Platform**: Browser-based SPA served by Vite locally and Cloudflare Worker infrastructure for app delivery  
**Project Type**: web application  
**Performance Goals**: Preserve current route rendering speed and keep color-token lookups limited to the existing CSS variable mechanism with no additional runtime interaction cost  
**Constraints**: Keep current visual intent substantially unchanged, confine work to maintained repository styles, avoid introducing page-specific color naming, preserve existing route and shell behavior  
**Scale/Scope**: Shared root stylesheet, shared navigation/card styles, route-level styles that still use literals, and focused regression checks in the existing test suite

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is an unfilled template with placeholder sections and no ratified repository-specific rules.
- Planning gate status: PASS by default because there are no enforceable constitutional requirements defined yet.
- Operational repository gates still apply for implementation:
  - Keep the change scoped to shared color tokenization and related regression coverage.
  - Preserve current user-visible meaning for navigation, content, warning, success, and error styling.
  - Validate implementation with `npm run lint` and `HOME=/tmp npm test`.
- Post-design re-check: PASS. The Phase 0 and Phase 1 artifacts remain within the requested scope and do not introduce new architectural or workflow concerns.

## Project Structure

### Documentation (this feature)

```text
specs/016-css-color-vars/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── color-token-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── _variables.css
├── style.css
├── client/
│   ├── components/
│   │   ├── card.css
│   │   └── nav.css
│   └── routes/
│       ├── home.css
│       ├── login.css
│       └── profile.css
└── server/
    └── [no expected changes]

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Keep the existing single-project web app structure. This feature is entirely a styling-system cleanup plus regression coverage, so the work stays in shared CSS files and the existing test entry points.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
