# Implementation Plan: HTM Rendering + TS Extension Migration

**Branch**: `006-migrate-htm-rendering` | **Date**: 2026-03-09 | **Spec**: [/Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/spec.md](/Users/nick/code/template-hono-spa/specs/006-migrate-htm-rendering/spec.md)
**Input**: Feature specification from `/specs/006-migrate-htm-rendering/spec.md` plus user directive: remove all JSX from server and rename `.tsx` files to `.ts`.

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Migrate rendering modules to template-literal style for client code, eliminate JSX usage from server code, and standardize file extensions from `.tsx` to `.ts` while preserving existing route and interaction behavior.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode)  
**Primary Dependencies**: Preact, route-event, Hono, Vite build pipeline  
**Storage**: N/A  
**Testing**: Vitest with Cloudflare workers test pool (`npm test`)  
**Target Platform**: Browser client + Cloudflare Worker server  
**Project Type**: Web application (single project with client and server code)  
**Performance Goals**: No measurable regression in route load behavior or interaction responsiveness during migration  
**Constraints**: Server must contain no JSX; `.tsx` files in migration scope must be renamed to `.ts`; output behavior must remain equivalent  
**Scale/Scope**: Current rendering modules under `src/client/`, `src/components/`, shared app entry points, and server entry currently using `.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file status: `/Users/nick/code/template-hono-spa/.specify/memory/constitution.md` is a placeholder template with no enforceable principles.
- Pre-Phase-0 gate result: PASS (no active constitutional constraints).
- Post-Phase-1 gate result: PASS (design introduces no constitution conflicts).

## Project Structure

### Documentation (this feature)

```text
specs/006-migrate-htm-rendering/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── migration-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── index.tsx
│   ├── not-found.tsx
│   ├── routes/
│   │   ├── about.tsx
│   │   ├── home.tsx
│   │   └── index.ts
│   └── state.ts
├── components/
│   ├── button.tsx
│   ├── card.tsx
│   ├── counter.tsx
│   └── nav.tsx
├── server/
│   ├── index.tsx
│   ├── startup-assets.ts
│   └── startup-errors.ts
└── app.tsx

test/
├── integration.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Keep single-project structure. Implementation will convert rendering modules to `.ts`, adjust imports/entry references, and preserve existing server endpoint behavior.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified.
