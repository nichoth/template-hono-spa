# Implementation Plan: Add logout button on profile route

**Branch**: `034-profile-logout-button` | **Date**: 2026-03-14 | **Spec**: [`specs/034-profile-logout-button/spec.md`](file:///Users/nick/code/template-hono-spa/specs/034-profile-logout-button/spec.md)
**Input**: Feature specification from `/specs/034-profile-logout-button/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Surface a logout button on the authenticated `/profile` page header area so desktop users can terminate their session without hunting for the control elsewhere; the existing logout handler and session state already live in the header, so this plan reuses the current mechanism while ensuring desktop-only styling and feedback states.

## Technical Context

**Language/Version**: TypeScript (ES2022) with CSS modules compiled by LightningCSS  
**Primary Dependencies**: Vite 8 build system, Preact + `htm/preact`, `@substrate-system` UI primitives, `route-event`, Hono for Cloudflare Workers routing, and shared LightningCSS config  
**Storage**: N/A (UI-only adjustment; session state is client-derived and cleared via existing auth service)  
**Testing**: Vitest 3 (existing suites cover UI/state flows)  
**Target Platform**: Desktop browsers served by Vite dev server or the Cloudflare Worker front-end runtime  
**Project Type**: Web application (single-page-like UI rendered in the browser with Cloudflare Worker backend)  
**Performance Goals**: Maintain current render and logout latency (<1s perceived response) while keeping styles tight for desktop layouts  
**Constraints**: Desktop-only interaction, CSS font sizes must stay ≥1rem per styling guidelines, LightningCSS custom media breakpoints already defined  
**Scale/Scope**: Touchpoints limited to `/profile` header area plus shared logout handling; no new backend endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No active constitution entries or gates defined in `.specify/memory/constitution.md`, so no additional restrictions apply beyond the core workflow.

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

```text
src/
├── app.ts                       # Vite entry configuring worker routes
├── client/
│   ├── index.ts                 # Client bootstrap wiring Preact + route-event
│   ├── state.ts                 # Shared signals for auth/session state
│   ├── login-status.ts          # Existing logout handler + header controls
│   ├── routes/
│   │   ├── profile.ts           # Profile view for this feature
│   │   ├── home.ts
│   │   └── ...                  # Other routes (login, signup, etc.)
│   └── components/              # Shared UI pieces (cards, buttons, avatars)
├── server/
│   └── ...                      # Hono API/service worker entrypoints
├── style.css
└── _variables.css               # LightningCSS variables (custom media breakpoints)
```

**Structure Decision**: We treat the repository as a single, combined front-end project because the logout button only touches client-side routing and shared CSS within `src/client`. This plan references the actual directories above rather than splitting into separate backend/frontend worktrees.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
