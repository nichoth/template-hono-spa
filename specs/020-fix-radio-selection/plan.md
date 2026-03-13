# Implementation Plan: Fix Radio Selection

**Branch**: `020-fix-radio-selection` | **Date**: 2026-03-12 | **Spec**: [/Users/nick/code/template-hono-spa/specs/020-fix-radio-selection/spec.md](/Users/nick/code/template-hono-spa/specs/020-fix-radio-selection/spec.md)
**Input**: Feature specification from `/specs/020-fix-radio-selection/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix the `/login` radio-selector interaction so passkey and password visibly select on the first click while continuing to use the installed shared radio-input control and its stylesheet. The implementation will preserve the existing login-route structure and UI-only flows, then tighten the selector’s event/state synchronization so the selected indicator, active method content, and route-local state stay aligned after a single interaction.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode) and CSS  
**Primary Dependencies**: Preact, `htm/preact`, `@preact/signals`, Hono, Vite 7, `@substrate-system/button`, `@substrate-system/input`, `@substrate-system/password-input`, `@substrate-system/radio-input`, existing route-management utilities  
**Storage**: N/A  
**Testing**: Vitest 3 worker tests, TypeScript typecheck, ESLint  
**Target Platform**: Browser-based SPA served by local Vite and Cloudflare Worker app shell routing  
**Project Type**: web application  
**Performance Goals**: Ensure selector state and visible selection update in the same client-side interaction cycle with no second-click requirement or perceptible lag  
**Constraints**: Preserve the existing `/login` route, keep the feature UI-only, continue using the installed radio-input control and stylesheet, retain current passkey and password flows, and scope changes to selector behavior plus regression coverage  
**Scale/Scope**: One client route, one stylesheet, route-local selection state, and targeted unit/integration coverage for single-click selection and method-content synchronization

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is still an unfilled template with placeholder sections and no ratified repository-specific rules.
- Planning gate status: PASS by default because there are no enforceable constitutional requirements defined yet.
- Operational repository gates still apply for implementation:
  - Keep the work bounded to the `/login` route UX, tests, and related docs.
  - Preserve the route’s existing UI-only authentication scope and current passkey/password behaviors.
  - Validate final changes with `npm run lint` and `HOME=/tmp npm test`.
- Post-design re-check: PASS. The Phase 0 and Phase 1 artifacts remain inside the current login-route boundary and introduce no new constitutional concerns.

## Project Structure

### Documentation (this feature)

```text
specs/020-fix-radio-selection/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-radio-selection-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── style.css
├── client/
│   ├── index.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── login.ts
│   │   └── login.css
│   └── state.ts
└── server/
    └── index.ts

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Keep the existing single-project web app structure. This feature stays within the current login route, the global stylesheet import that provides shared radio-input styling, and the existing unit/integration test files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
