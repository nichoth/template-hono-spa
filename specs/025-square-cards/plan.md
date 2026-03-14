# Implementation Plan: Square Home Cards

**Branch**: `[025-square-cards]` | **Date**: 2026-03-13 | **Spec**: [/Users/nick/code/template-hono-spa/specs/025-square-cards/spec.md](/Users/nick/code/template-hono-spa/specs/025-square-cards/spec.md)
**Input**: Feature specification from `/specs/025-square-cards/spec.md` plus user clarification: "Lets make overflow scroll if necessary to fit 3 square cards on screen at this resolution [Image #1]"

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Update the home-route card grid so it prefers a single visible row of three square cards at the reference desktop resolution, while allowing horizontal scrolling when the viewport cannot fit that width comfortably. The implementation should stay CSS-first by replacing the current tall `grid-auto-rows` behavior with an explicit three-column, horizontally scrollable grid and a square preferred aspect ratio on cards that can still grow taller when content needs more room.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (ES2022, strict mode) and CSS via Vite 8  
**Primary Dependencies**: Preact, `htm/preact`, `@preact/signals`, Hono shell app, Lightning CSS pipeline  
**Storage**: N/A  
**Testing**: Vitest 3 worker tests in `/Users/nick/code/template-hono-spa/test/*.spec.ts`; lint via ESLint  
**Target Platform**: Browser-rendered SPA served by Hono/Cloudflare Workers, with primary concern on desktop viewport matching the supplied screenshot  
**Project Type**: Web application  
**Performance Goals**: Preserve current lightweight client rendering and keep layout changes CSS-only where possible to avoid extra runtime work  
**Constraints**: Keep existing home card content and controls usable; prefer square cards but allow cards to grow vertically for readable content; allow horizontal overflow scrolling when three square cards cannot fit in viewport width  
**Scale/Scope**: Home route only; expected code touch points are the home-route CSS, shared card CSS, and targeted tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `/Users/nick/code/template-hono-spa/.specify/memory/constitution.md` is still an unfilled template with placeholder section names and no enforceable project rules.
- Result: no concrete constitutional gates are defined, so there are no actionable blockers for Phase 0.
- Practical checks applied instead: keep scope limited to the home route, preserve existing interactions, and use the repo’s existing `npm test` / `npm run lint` verification flow.
- Phase 1 re-check result: still passes; the design remains CSS-first, single-feature scoped, and does not introduce new runtime or storage complexity.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── client/
│   ├── components/
│   │   ├── card.css
│   │   ├── card.ts
│   │   └── counter.ts
│   └── routes/
│       ├── home.css
│       └── home.ts
├── server/
└── style.css

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts
```

**Structure Decision**: This feature is a single web application. The implementation should stay within the existing client route and shared component styles under `/Users/nick/code/template-hono-spa/src/client/...`, with verification added to `/Users/nick/code/template-hono-spa/test/unit.spec.ts` or another existing Vitest spec file instead of creating a new test root.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
