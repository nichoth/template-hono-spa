# Implementation Plan: Real Passkey Login Backend

**Branch**: `023-passkey-auth-backend` | **Date**: 2026-03-13 | **Spec**: [spec.md](/Users/nick/code/template-hono-spa/specs/023-passkey-auth-backend/spec.md)
**Input**: Feature specification from `/specs/023-passkey-auth-backend/spec.md`

## Summary

Add a real backend-backed passkey authentication system for sign-up, sign-in, session restoration, and sign-out. The implementation will add persistent auth storage with Cloudflare D1, server-managed challenge and session handling, backend auth endpoints, client integration for WebAuthn flows, and the required `wrangler.jsonc` bindings so local, staging, and production environments can access the auth database consistently.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode)  
**Primary Dependencies**: Hono, Preact, `@preact/signals`, `ky`, Wrangler, Cloudflare Workers runtime, Web Crypto APIs, browser WebAuthn APIs  
**Storage**: Cloudflare D1 for users, passkey credentials, auth challenges, sessions, and auth events  
**Testing**: Vitest 3, `@cloudflare/vitest-pool-workers`, existing unit/integration test suites  
**Target Platform**: Cloudflare Workers backend with browser-based client flows  
**Project Type**: Web application with Worker-hosted API and client SPA  
**Performance Goals**: Passkey registration and sign-in round trips complete fast enough to keep the full user flow under 2 minutes; session lookup remains suitable for normal interactive navigation  
**Constraints**: Backend must own trust decisions, support durable sessions across requests, preserve current app entry points, and include any required `wrangler.jsonc` bindings for local and deployed environments  
**Scale/Scope**: Initial production-ready auth for one web app with persisted users, multiple passkey credentials per user, and session lifecycle support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file is still an unfilled template with no enforceable project rules. No constitutional gates block Phase 0 research or Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/023-passkey-auth-backend/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── passkey-auth-api-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── routes/
│   └── state.ts
├── server/
│   ├── index.ts
│   ├── auth/
│   ├── db/
│   └── session/
└── worker-configuration.d.ts

test/
├── integration.spec.ts
└── unit.spec.ts

wrangler.jsonc
```

**Structure Decision**: Keep the existing single-project layout. Add focused server-side auth and database modules under `src/server/`, extend the existing client state and login/signup flows, and wire Cloudflare resource bindings through `wrangler.jsonc` and generated Worker type definitions.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required at this stage.
