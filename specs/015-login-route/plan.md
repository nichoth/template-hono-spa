# Implementation Plan: Login Route

**Branch**: `015-login-route` | **Date**: 2026-03-11 | **Spec**: [/Users/nick/code/template-hono-spa/specs/015-login-route/spec.md](/Users/nick/code/template-hono-spa/specs/015-login-route/spec.md)
**Input**: Feature specification from `/specs/015-login-route/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a new client-side `/login` route that renders a UI-only login form, validates required fields locally, and shows a clear non-authenticating submit message. The implementation will extend the existing centralized route registry, register the requested Substrate web components in the client bootstrap, add route-specific styling and form state handling, and protect existing shell and route behavior with unit and integration coverage.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode) and CSS  
**Primary Dependencies**: Preact, `htm/preact`, `@preact/signals`, `route-event`, Hono, `@substrate-system/routes`, `@substrate-system/button`, `@substrate-system/input`, `@substrate-system/password-input`  
**Storage**: N/A  
**Testing**: Vitest 3 with `@cloudflare/vitest-pool-workers`, plus ESLint  
**Target Platform**: Browser-based SPA served by a Cloudflare Worker and local Vite dev server  
**Project Type**: web application  
**Performance Goals**: The `/login` route should render within the existing client-route experience and show validation or submit feedback in the same interaction cycle without requiring network latency  
**Constraints**: UI-only login flow, no credential verification or session creation, preserve existing public route behavior and shell rendering, use the specified Substrate form components, keep `/api/*` and `/health` behavior unchanged  
**Scale/Scope**: One new client route, one form, route metadata/navigation updates, route-specific styles, and focused route validation tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is still an unfilled template with placeholder principles, so it defines no enforceable project-specific gates.
- Planning gate status: PASS by default because there are no ratified rules to violate.
- Operational repo checks still apply for implementation:
  - Keep the feature bounded to the UI-only scope defined in the spec.
  - Add or update automated tests for route metadata, shell access, and login form behavior.
  - Finish implementation validation with `npm run lint` and `HOME=/tmp npm test`.
- Post-design re-check: PASS. Phase 1 artifacts keep the work within the same UI-only scope and do not introduce any new constitutional concerns.

## Project Structure

### Documentation (this feature)

```text
specs/015-login-route/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-route-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.ts
├── style.css
├── client/
│   ├── index.ts
│   ├── state.ts
│   ├── components/
│   │   └── nav.ts
│   └── routes/
│       ├── about.ts
│       ├── home.ts
│       ├── index.ts
│       ├── profile.ts
│       └── [login route files to add]
└── server/
    └── index.ts

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Keep the existing single-project web app structure. The feature lives entirely in the client route layer, shared styles, and the existing test files, with no new backend or package boundary.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
