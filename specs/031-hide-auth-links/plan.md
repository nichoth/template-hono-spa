# Implementation Plan: Hide auth links

**Branch**: `[031-hide-auth-links]` | **Date**: 2026-03-14 | **Spec**: [spec.md](/Users/nick/code/template-hono-spa/specs/031-hide-auth-links/spec.md)  
**Input**: Feature specification from `/specs/031-hide-auth-links/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Filter the shared navigation routes so authenticated users no longer see Login/Create Account in the desktop/mobile headers while anonymous visitors retain access to the auth flows.

## Technical Context

**Language/Version**: TypeScript 5.9 targeting ES2022 modules in a Vite 8-built client running on Cloudflare Workers.  
**Primary Dependencies**: Preact 10, `@preact/signals`, `route-event` routing helpers, `@substrate-system` state utilities, Hono for API routing, `ky` for HTTP calls.  
**Storage**: No persistent storage changes; the header watches the same session signal populated by `/api/session`.  
**Testing**: Vitest 3.2 unit/integration suites, especially `test/unit.spec.ts`, plus CSS snapshots for the nav.  
**Target Platform**: Browser clients (desktop and mobile) served from the Cloudflare Worker runtime via Wrangler.  
**Project Type**: Web application (SPAs with client/server split handled within `src/`).  
**Performance Goals**: Keep header renders stable (no layout shifts) while filtering entries after session hydration completes.  
**Constraints**: Filtering must only remove the Login/Create Account entries, work on the shared `routes` list, and respond to session signal changes.  
**Scale/Scope**: Limited to header rendering logic in `src/client/components/nav.ts`/`src/client/index.ts` and associated tests/documentation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution is a placeholder with no active gates, so no violations are present and research can begin immediately.

## Project Structure

### Documentation (this feature)

```text
specs/031-hide-auth-links/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/specify.plan command - not yet created)
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── components/
│   │   ├── nav.ts
│   │   └── nav.css
│   ├── routes/
│   │   └── index.ts
│   ├── state.ts
│   └── index.ts
├── app.ts
└── style.css
public/
specs/
├── 030-show-login-state/
│   ├── spec.md
│   └── plan.md
└── 031-hide-auth-links/
    ├── spec.md
    └── plan.md
tests/
└── unit.spec.ts
```

**Structure Decision**: This feature extends the existing single web app layout by touching the shared nav data/renderers (`src/client/components/nav.ts`, `src/client/routes/index.ts`) and header (`src/client/index.ts`), so Option 2 (web application) is the working structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution gates exist, so there are no tracked violations.
