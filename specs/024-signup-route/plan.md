# Implementation Plan: Dedicated Signup Route

**Branch**: `[024-signup-route]` | **Date**: 2026-03-12 | **Spec**: [/Users/nick/code/template-hono-spa/specs/024-signup-route/spec.md](/Users/nick/code/template-hono-spa/specs/024-signup-route/spec.md)
**Input**: Feature specification from `/Users/nick/code/template-hono-spa/specs/024-signup-route/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a dedicated `/signup` route that separates account creation from sign-in while preserving the existing radio-selector UX. The implementation will reuse the current passkey registration backend, keep `/login` sign-in only, and add clear route-to-route navigation between sign-in and signup.

## Technical Context

**Language/Version**: TypeScript (ESM, ES2022 strict mode)  
**Primary Dependencies**: Preact, Hono, Vite 8, `route-event`, `ky`, `@substrate-system/radio-input`, `@substrate-system/input`, `@substrate-system/password-input`, `@simplewebauthn/browser`, `@simplewebauthn/server`  
**Storage**: Cloudflare D1 auth persistence already used by the existing auth backend  
**Testing**: Vitest 3, `@cloudflare/vitest-pool-workers`, ESLint  
**Target Platform**: Cloudflare Workers-backed web app with browser-rendered Preact client  
**Project Type**: Web application  
**Performance Goals**: Signup and login route loads remain immediate in local development and route interactions complete within standard single-page-app expectations  
**Constraints**: Preserve the existing sign-in flow, reuse the shared radio-selector pattern, keep signup submission on the registration API path, and support direct client-side navigation to `/signup`  
**Scale/Scope**: One new client route, one linked sign-in/signup UX pair, and incremental reuse of the existing auth backend and session model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `.specify/memory/constitution.md` is still an unfilled template with placeholder principles only.
- No enforceable constitutional rules are currently defined.
- Initial gate status: PASS
- Post-design gate status: PASS

## Project Structure

### Documentation (this feature)

```text
specs/024-signup-route/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── signup-route-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── components/
│   ├── routes/
│   ├── index.ts
│   └── state.ts
├── server/
│   ├── auth/
│   ├── db/
│   └── index.ts
└── style.css

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts
```

**Structure Decision**: This feature fits the existing single web application structure. The work is concentrated in `src/client/routes/`, `src/client/state.ts`, shared route registration, and existing auth-backed server paths already exposed from `src/server/index.ts`.

## Complexity Tracking

> No constitutional violations to justify; section intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
