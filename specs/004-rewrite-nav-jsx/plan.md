# Implementation Plan: Rewrite Navigation Component to JSX

**Branch**: `004-rewrite-nav-jsx` | **Date**: 2026-03-09 | **Spec**: [/Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/spec.md](/Users/nick/code/template-hono-spa/specs/004-rewrite-nav-jsx/spec.md)
**Input**: Feature specification from `/specs/004-rewrite-nav-jsx/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the legacy template-literal-based navigation component with repository-standard JSX authoring while preserving navigation behavior, active-state indication, and maintainability expectations defined in the feature spec.

## Technical Context

**Language/Version**: TypeScript (ESM), Node.js runtime  
**Primary Dependencies**: Preact, @preact/signals, @substrate-system/routes, Hono, Vite, Cloudflare Worker tooling  
**Storage**: Filesystem static assets and generated build output (no new persistent storage)  
**Testing**: Vitest (`npm test`) and ESLint (`npm run lint`)  
**Target Platform**: Browser client (CSR) plus Cloudflare Worker server runtime  
**Project Type**: Web application (client-rendered UI with server/API layer)  
**Performance Goals**: No visible regression in navigation responsiveness; route changes remain immediate under normal local dev conditions  
**Constraints**: Preserve current route paths/labels, preserve active-link behavior, and align component syntax with repo JSX conventions  
**Scale/Scope**: Single component rewrite (`src/components/nav.tsx` as JSX source) and minimal call-site/type adjustments required to compile and validate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file (`/Users/nick/code/template-hono-spa/.specify/memory/constitution.md`) currently contains placeholder/template content only and defines no enforceable principles or gates.

Result (Pre-Phase 0): PASS (no active constitution constraints to fail).

## Project Structure

### Documentation (this feature)

```text
specs/004-rewrite-nav-jsx/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── nav-component-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.tsx
├── client/
│   ├── index.tsx
│   ├── state.ts
│   └── routes/
│       ├── index.ts
│       ├── home.tsx
│       └── about.tsx
├── components/
│   ├── nav.tsx
│   └── nav.css
├── server/
│   ├── index.tsx
│   ├── startup-assets.ts
│   └── startup-errors.ts

test/
├── integration.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Keep single-project layout and scope changes to the existing navigation component path under `src/components/` with minimal supporting updates where required.

## Implementation Notes

- Replaced legacy template-literal navigation rendering with JSX in `src/components/nav.tsx`.
- Reused shared `Nav` component from both `src/app.tsx` and `src/client/index.tsx` to keep behavior consistent.
- Normalized route matching in `Nav` to preserve active-state behavior with query-string paths.
- Updated route list typing in `src/client/routes/index.ts` to `ReadonlyArray<AppRoute>` for safer maintenance.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Constitution Re-Check (Post-Phase 1)

Result (Post-Phase 1): PASS (constitution still has no enforceable gates; produced artifacts are consistent with feature requirements).
