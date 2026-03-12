# Implementation Plan: Login Radio Style

**Branch**: `019-login-radio-style` | **Date**: 2026-03-12 | **Spec**: [/Users/nick/code/template-hono-spa/specs/019-login-radio-style/spec.md](/Users/nick/code/template-hono-spa/specs/019-login-radio-style/spec.md)
**Input**: Feature specification from `/specs/019-login-radio-style/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refine the existing `/login` passkey-vs-password selector so it still uses the current shared radio-input control but visually matches the referenced create-account pattern more closely. The implementation will keep the current route-local sign-in state and UI-only behavior, then adjust selector layout, spacing, and selected-state presentation in the login route and its styles while preserving existing passkey and password flows and reinforcing regression coverage.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode) and CSS  
**Primary Dependencies**: Preact, `htm/preact`, `@preact/signals`, Hono, Vite 7, `@substrate-system/button`, `@substrate-system/input`, `@substrate-system/password-input`, `@substrate-system/radio-input`, existing route-management utilities  
**Storage**: N/A  
**Testing**: Vitest 3 worker tests, TypeScript typecheck, ESLint  
**Target Platform**: Browser-based SPA served by local Vite and Cloudflare Worker app shell routing  
**Project Type**: web application  
**Performance Goals**: Keep selector updates within the current client-side interaction cycle with no added route transitions, network dependence, or perceptible delay in method switching  
**Constraints**: Preserve the existing `/login` route, keep the feature UI-only, retain passkey and password behavior, continue using the installed radio-input custom element, and scope the change to selector presentation plus focused regression coverage  
**Scale/Scope**: One client route, one stylesheet, existing route-local state, and targeted unit/integration verification for shared selector presentation and method switching

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is still an unfilled template with placeholder sections and no ratified repository-specific rules.
- Planning gate status: PASS by default because there are no enforceable constitutional requirements defined yet.
- Operational repository gates still apply for implementation:
  - Keep the work bounded to the `/login` route UX, tests, and related docs.
  - Preserve the route’s existing UI-only authentication scope and current passkey/password behaviors.
  - Validate final changes with `npm run lint` and `HOME=/tmp npm test`.
- Post-design re-check: PASS. The Phase 0 and Phase 1 artifacts remain within the login-route UI boundary and add no new constitutional concerns.

## Project Structure

### Documentation (this feature)

```text
specs/019-login-radio-style/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-radio-style-contract.md
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

**Structure Decision**: Keep the existing single-project web app structure. This feature stays within the current login route, its route-level styling, the client bootstrap that registers the radio-input element, and the existing unit/integration test files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
