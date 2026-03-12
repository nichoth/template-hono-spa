# Implementation Plan: Passkey Login UX

**Branch**: `017-passkey-login-ux` | **Date**: 2026-03-12 | **Spec**: [/Users/nick/code/template-hono-spa/specs/017-passkey-login-ux/spec.md](/Users/nick/code/template-hono-spa/specs/017-passkey-login-ux/spec.md)
**Input**: Feature specification from `/specs/017-passkey-login-ux/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Extend the existing UI-only `/login` route so it supports a direct passkey-first path while preserving the current password path as a clear fallback. The implementation will add explicit login-method state to the current route module, adjust the route copy and layout so the active method is obvious, and expand unit and integration coverage around login-method switching, visibility, and UI-only submit behavior.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode) and CSS  
**Primary Dependencies**: Preact, `htm/preact`, `@preact/signals`, Hono, Vite 7, `@substrate-system/button`, `@substrate-system/input`, `@substrate-system/password-input`, existing route-management utilities  
**Storage**: N/A  
**Testing**: Vitest 3 worker tests, TypeScript typecheck, ESLint  
**Target Platform**: Browser-based SPA served by local Vite and Cloudflare Worker app shell routing  
**Project Type**: web application  
**Performance Goals**: Keep login-screen method selection and validation updates within the current client-side interaction cycle with no added route transitions or network dependence for the UI-only flow  
**Constraints**: Preserve the existing `/login` route and current password fallback, keep the feature UI-only unless current login behavior already remains UI-only, make the active method obvious without relying on low-context technical controls, leave unrelated routes and navigation unchanged  
**Scale/Scope**: One client route, its route-local styles and state, supporting unit/integration coverage, and no new backend auth system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is still an unfilled template with placeholder sections and no ratified repository-specific rules.
- Planning gate status: PASS by default because there are no enforceable constitutional requirements defined yet.
- Operational repository gates still apply for implementation:
  - Keep the work bounded to the `/login` route UX, tests, and related docs.
  - Preserve the route’s existing UI-only authentication scope unless the current implementation already defines real auth behavior.
  - Validate final changes with `npm run lint` and `HOME=/tmp npm test`.
- Post-design re-check: PASS. The Phase 0 and Phase 1 artifacts keep the feature inside the current client-route boundary and do not introduce new constitutional concerns.

## Project Structure

### Documentation (this feature)

```text
specs/017-passkey-login-ux/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-method-ui-contract.md
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
