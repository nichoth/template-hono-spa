## Summary

Ensure the navigation menus derive their entries from `getNavRoutes(authenticated)` so that authenticated viewers no longer see the `Login` and `Create Account` links across desktop and mobile, keeping both navs in sync via the shared signal state.

## Technical Context

**Language/Version**: TypeScript 5.9 targeting ES2022 modules built with Vite 8 for browser and Cloudflare Workers execution.  
**Primary Dependencies**: Preact 10, `@preact/signals`, route-event routing helpers, `@substrate-system/*` UI primitives, LightningCSS, Ky for HTTP, and Hono/Cloudflare Workers for the backend shell.  
**Storage**: No new storage; uses existing Cloudflare Workers runtime state and session cookies already driving `State.user`.  
**Testing**: Vitest 3.2 (via `npm test`) for unit/browser tests, plus `npm run lint` for static checks; rely on manual QA following quickstart steps for UI validation.  
**Target Platform**: Browser-based SPA served via Vite/Workers (desktop + mobile) with the Hono backend handling API routes.  
**Project Type**: Full-stack web application with a shared TypeScript workspace for client routes/components and backend services.  
**Performance Goals**: Navigation updates should react to auth changes within one render cycle (~<200ms) so the UI never shows stale links.  
**Constraints**: No backend changes or additional API calls—reuse the existing `state.user` signal and nav data so the feature remains a lightweight UI adjustment.  
**Scale/Scope**: Small UI-focused change touching `src/client/components/nav.ts`, `src/client/routes/index.ts`, and related CSS; documentation updates live under `specs/036-hide-auth-links`.

## Constitution Check

*GATE: Constitution is the stock template with no concrete requirements, so there are no additional gates to satisfy before Phase 0.*

## Project Structure

### Documentation (this feature)

```text
specs/036-hide-auth-links/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── nav-contract.md
└── tasks.md
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
│   └── login-status.ts
├── server/
│   ├── auth/
│   └── index.ts
└── routes/

specs/036-hide-auth-links/
    └── plan.md

docs/

README.md
```

**Structure Decision**: No additional modules are required—work happens inside the existing SPA (`src/client`) and leverages central navigation routes plus the shared component library.

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
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
