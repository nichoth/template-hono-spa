# Implementation Plan: Reliable Local Dev Startup

**Branch**: `001-fix-npm-start` | **Date**: 2026-03-09 | **Spec**: [/Users/nick/code/template-hono-spa/specs/001-fix-npm-start/spec.md](/Users/nick/code/template-hono-spa/specs/001-fix-npm-start/spec.md)
**Input**: Feature specification from `/specs/001-fix-npm-start/spec.md`

## Summary

Make `npm start` reliable from a clean checkout by removing runtime dependence on generated `public/` manifest artifacts and by returning a client-rendered shell (no server-side app rendering), with actionable startup failure messages.

## Technical Context

**Language/Version**: TypeScript (ESM), Node.js runtime  
**Primary Dependencies**: Vite, Hono, Preact, `@cloudflare/vite-plugin`, `@cloudflare/vitest-pool-workers`  
**Storage**: Local filesystem assets (`_public/` for test static assets; `public/` reserved for build output only)  
**Testing**: Vitest + Cloudflare worker pool (`npm test`)  
**Target Platform**: Local dev machines and Cloudflare Workers runtime  
**Project Type**: Web application  
**Performance Goals**: Dev startup returns HTTP 200 at local root path in under 10 seconds on standard local environment  
**Constraints**: No server-side app rendering; startup must not require manual `public/` preparation  
**Scale/Scope**: Single-template app used for contributor onboarding and local iteration

## Constitution Check

No enforceable constitution gates are currently defined in `/Users/nick/code/template-hono-spa/.specify/memory/constitution.md` (template placeholders only).  
Result (pre/post design): PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-npm-start/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dev-startup-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.tsx
├── client/index.tsx
├── server/
│   ├── index.tsx
│   ├── startup-assets.ts
│   └── startup-errors.ts
└── ...

test/
├── unit.spec.ts
└── integration.spec.ts

_public/
└── robots.txt
```

**Structure Decision**: Keep a single-project web app structure and isolate startup resilience logic in `src/server/` helpers.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
