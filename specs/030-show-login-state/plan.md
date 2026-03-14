# Implementation Plan: Show login state

**Branch**: `[030-show-login-state]` | **Date**: 2026-03-14 | **Spec**: [spec.md](/Users/nick/code/template-hono-spa/specs/030-show-login-state/spec.md)  
**Input**: Feature specification from `/specs/030-show-login-state/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Surface the login state in the desktop hero header by reading the restored session (`state.user`) and rendering `logged in as <identifier>` (or `anonymous`) between the nav links and avatar, while keeping the mobile layout untouched.

## Technical Context

**Language/Version**: TypeScript 5.9 targeting ES2022 modules running in Vite 8-built client and Cloudflare Workers shell.  
**Primary Dependencies**: Preact 10, `@preact/signals`, `htm`, `State` helpers from `@substrate-system/state`, Hono-powered server routes, `ky` for HTTP requests.  
**Storage**: No new storage; header reads transient `Session` data returned from `/api/session`.  
**Testing**: Vitest 3.2 suites covering unit/integration flows plus existing CSS snapshot checks in `test/unit.spec.ts`.  
**Target Platform**: Browser clients (desktop/mobile) served by Cloudflare Worker runtime (`wrangler`).  
**Project Type**: Web application (single-page app) with server companion for auth routes.  
**Performance Goals**: Maintain sub-second hydration for header text; avoid additional API calls or layout shifts.  
**Constraints**: CSS must keep new text at least 1rem, match nav link color, and hide on widths below ~680px.  
**Scale/Scope**: Touches global header, one new UI element, and existing session signal; impact limited to desktop experience.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file currently contains placeholder sections and states no actionable gates. There are no violations to justify, so Phase 0 may proceed.

## Project Structure

### Documentation (this feature)

```text
specs/030-show-login-state/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/
│   └── session-response.md  # Phase 1 output (/speckit.plan command)
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
│   │   └── login.ts
│   ├── state.ts
│   └── index.ts
├── app.ts
└── style.css
public/
specs/
├── 030-show-login-state/
│   ├── spec.md
│   └── plan.md
tests/
└── unit.spec.ts
```

**Structure Decision**: The project is a single web client plus server assets inside `src/`; the feature only modifies the client shell (`src/client/index.ts`, `src/style.css`) and relies on session routes already defined. This matches the Option 2 web application layout without adding additional top-level services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution gates exist, so no violations require tracking.
