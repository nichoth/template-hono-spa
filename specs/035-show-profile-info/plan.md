# Implementation Plan: Show Profile Info

**Branch**: `035-show-profile-info` | **Date**: 2026-03-14 | **Spec**: specs/035-show-profile-info/spec.md
**Input**: Feature specification from `specs/035-show-profile-info/spec.md`

## Summary

Expose every session-bound profile attribute on `/profile` by extending the backend session payload with the stored `login_method`, keeping `State.user` as the single source of truth, and rendering a labeled profile card with fallbacks when fields are missing.

## Technical Context

**Language/Version**: TypeScript 5.9 targeting ES2022 modules that run through Vite 8 on browsers and Cloudflare Workers.  
**Primary Dependencies**: Preact 10 with `@preact/signals`, Hono + Cloudflare Workers tooling, `route-event`, `ky`, `@substrate-system` primitives (`button`, `radio-input`, `state`, `debug`), LightningCSS, and `@simplewebauthn/browser`/server helpers for auth workflows.  
**Storage**: Cloudflare D1 hosting the `users`, `sessions`, `devices`, and other auth-related tables; `users` already contains the identifier/display name fields and will store the `login_method` flag.  
**Testing**: Vitest 3.2 powered by `@cloudflare/vitest-pool-workers` for runtime compatibility, with `npm test`/`npm run lint` as the standard verification commands.  
**Target Platform**: Cloudflare Workers for the Hono API layer and a Vite-built Preact SPA served as a worker shell in browsers.  
**Project Type**: Full-stack web application with a Cloudflare worker backend and a Preact-based frontend.  
**Performance Goals**: Profile landing must fully render within ~1 second of navigation, relying on `/api/session` returning in under ~200ms so the `State.user` signal updates quickly.  
**Constraints**: No new API routes; reuse the existing `/api/session` endpoint and `State.user` signal. Keep everything in strict TypeScript (ES2022) and keep frontend logic simple to avoid blocking the main thread.  
**Scale/Scope**: Low-impact feature touching the profile route, session contract, and user record; changes remain confined to `src/client/routes/profile.ts`, `src/server/auth/index.ts`, `src/client/state.ts`, and auth-related tables in D1.

## Constitution Check

*GATE: The constitution file is the stock template without concrete gates, so there are currently no special constitutional requirements to satisfy. Proceeding under the default workflow with no violations.*

- **Phase 1 re-check**: There were still no constitution clauses defined, so no additional gates or adjustments are needed.

## Project Structure

### Documentation (this feature)

```text
specs/035-show-profile-info/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── session-response.md
│   └── profile-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── routes/
│   │   └── profile.ts
│   ├── state.ts
│   ├── login-status.ts
│   └── index.ts
├── server/
│   ├── auth/
│   │   └── index.ts
│   └── index.ts
└── components/

specs/
└── 035-show-profile-info/
    └── plan.md

docs/

README.md
```

**Structure Decision**: The feature targets the existing monorepo layout with a Cloudflare worker backend under `src/server`, a Preac-based SPA under `src/client`, and the feature documentation housed in `specs/035-show-profile-info`. No new top-level modules or services are required.
