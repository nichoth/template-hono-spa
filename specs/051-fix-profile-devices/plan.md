# Implementation Plan: Profile Device List Visibility

**Branch**: `051-fix-profile-devices` | **Date**: 2026-03-19 | **Spec**: [/Users/nick/code/template-hono-spa/specs/051-fix-profile-devices/spec.md](/Users/nick/code/template-hono-spa/specs/051-fix-profile-devices/spec.md)
**Input**: Feature specification from `/specs/051-fix-profile-devices/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Restore the `/profile` device list so authenticated users reliably see their registered devices, including the current device, on first load. The plan centers on fixing the client-side session-to-device loading sequence, preserving explicit loading/empty/error states in the profile UI, and adding regression coverage at the client-state and integration boundaries.

## Technical Context

**Language/Version**: TypeScript 5.x, ESM  
**Primary Dependencies**: Preact, `htm`, `@preact/signals`, `@substrate-system/state`, `ky`, Hono, `@simplewebauthn/server`, `@simplewebauthn/browser`  
**Storage**: Cloudflare D1 auth tables (`users`, `devices`, `sessions`, `device_invitations`)  
**Testing**: Vitest, `@cloudflare/vitest-pool-workers`, existing tests in `test/`  
**Target Platform**: Browser SPA served by Vite with Cloudflare Workers backend  
**Project Type**: Web application with client SPA and worker-backed auth API  
**Performance Goals**: The Devices section should populate on the first `/profile` visit after session restoration, without requiring refresh or secondary action  
**Constraints**: No new dependencies; keep changes minimal; use `@preact/signals` for client state; preserve existing `/api/auth/passkey/devices` response shape and current-device/revoked-device behavior  
**Scale/Scope**: One profile route, one client state bootstrap path, one device-list endpoint contract, and focused regression coverage in existing Vitest suites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `.specify/memory/constitution.md` currently contains placeholder scaffold text and no ratified project-specific gates.
- Effective working rules come from repo instructions instead: write as little code as possible, do not add dependencies without asking, and use `@preact/signals` for client-side state.
- **Pre-Phase 0 Gate**: PASS. No constitution violations identified for the planned work.
- **Post-Phase 1 Gate**: PASS. The design keeps the existing architecture, adds no dependencies, and stays within the repo’s client-state conventions.

## Project Structure

### Documentation (this feature)

```text
specs/051-fix-profile-devices/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── profile-devices-api.md
│   └── profile-devices-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── index.ts
│   ├── state.ts
│   ├── routes/
│   │   └── profile.ts
│   └── util/
│       └── index.ts
└── server/
    ├── index.ts
    ├── auth/
    │   └── index.ts
    └── db/
        ├── index.ts
        └── schema.ts

test/
├── integration.spec.ts
├── state-polling.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Use the existing single-repo web application structure. The change is primarily a client-state and profile-route fix, with server contracts documented because the UI depends on `/api/auth/passkey/devices`.

## Complexity Tracking

No constitution exceptions or complexity justifications are required for this feature.
