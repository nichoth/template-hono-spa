# Implementation Plan: Radio Passkey Control

**Branch**: `018-radio-passkey-control` | **Date**: 2026-03-12 | **Spec**: [/Users/nick/code/template-hono-spa/specs/018-radio-passkey-control/spec.md](/Users/nick/code/template-hono-spa/specs/018-radio-passkey-control/spec.md)
**Input**: Feature specification from `/specs/018-radio-passkey-control/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the current passkey-vs-password toggle treatment on `/login` with a radio-button selector that matches the requested example while preserving the existing password fallback and passkey attempt behavior. The implementation will adapt the current route-local login-method state to drive a radio group, update the route presentation and styling around the selected radio option, and expand unit and integration coverage around radio selection, active state, and password fallback behavior.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode) and CSS  
**Primary Dependencies**: Preact, `htm/preact`, `@preact/signals`, Hono, Vite 7, `@substrate-system/button`, `@substrate-system/input`, `@substrate-system/password-input`, `@substrate-system/radio-input`, existing route-management utilities  
**Storage**: N/A  
**Testing**: Vitest 3 worker tests, TypeScript typecheck, ESLint  
**Target Platform**: Browser-based SPA served by local Vite and Cloudflare Worker app shell routing  
**Project Type**: web application  
**Performance Goals**: Keep login-method switching and validation updates within the current client-side interaction cycle with no added route transitions or network dependence for the UI-only flow  
**Constraints**: Preserve the existing `/login` route and current password fallback, keep the feature UI-only, use a radio-button method selector consistent with the referenced pattern, leave unrelated routes and navigation unchanged  
**Scale/Scope**: One client route, its styles, route-local state, and focused unit/integration coverage for radio selection and login-method behavior

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is still an unfilled template with placeholder sections and no ratified repository-specific rules.
- Planning gate status: PASS by default because there are no enforceable constitutional requirements defined yet.
- Operational repository gates still apply for implementation:
  - Keep the work bounded to the `/login` route UX, tests, and related docs.
  - Preserve the route’s existing UI-only authentication scope.
  - Validate final changes with `npm run lint` and `HOME=/tmp npm test`.
- Post-design re-check: PASS. The Phase 0 and Phase 1 artifacts stay within the current client-route boundary and do not introduce new constitutional concerns.

## Project Structure

### Documentation (this feature)

```text
specs/018-radio-passkey-control/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-radio-selector-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── style.css
├── client/
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

**Structure Decision**: Keep the existing single-project web app structure. This feature stays in the current client-managed login route, its styling, and the existing worker/unit test files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
