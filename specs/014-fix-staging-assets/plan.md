# Implementation Plan: Staging Asset Loading Reliability

**Branch**: `014-fix-staging-assets` | **Date**: 2026-03-11 | **Spec**: [/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/spec.md](/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/spec.md)
**Input**: Feature specification from `/specs/014-fix-staging-assets/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix staging shell asset resolution so deployed HTML references CSS and JavaScript files that actually exist in staging, while preserving local and other working-environment behavior and improving diagnosis when asset metadata is missing or invalid.

## Technical Context

**Language/Version**: TypeScript (ES2022, strict mode)  
**Primary Dependencies**: Hono, Cloudflare Workers runtime bindings, Vite 7, Vitest 3  
**Storage**: N/A  
**Testing**: Vitest (`HOME=/tmp npm test`), TypeScript test typecheck (`npm run test:typecheck`), ESLint (`npm run lint`)  
**Target Platform**: Cloudflare Worker backend serving a SPA shell and static build assets  
**Project Type**: Web application (SPA client + Worker backend)  
**Performance Goals**: Asset-resolution logic must keep shell generation effectively immediate and avoid adding noticeable delay to first-page rendering  
**Constraints**: Staging must not emit asset URLs that 404; local dev behavior must remain intact; shell asset references must remain consistent with deployed build output; diagnosis must be possible when manifest-based resolution fails  
**Scale/Scope**: Server-side startup asset resolution, shell HTML asset references, build/deploy path consistency, and request-level regression coverage for shell asset URLs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file status: [/Users/nick/code/template-hono-spa/.specify/memory/constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is an unfilled template with no enforceable project-specific rules.
- Pre-Phase-0 gate result: PASS. No active constitutional constraints block planning work.
- External planning risk: this feature was renumbered from `001-*` to `014-*` because the repo already had an existing `001-*` spec directory. Numeric-prefix tooling may still be sensitive to stale assumptions if older references remain elsewhere.
- Post-Phase-1 gate result: PASS. The design stays within the existing Worker asset-resolution path and adds verification rather than introducing new architecture.

## Project Structure

### Documentation (this feature)

```text
/Users/nick/code/template-hono-spa/specs/014-fix-staging-assets/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── asset-loading-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/nick/code/template-hono-spa/src/
├── server/
│   ├── index.ts
│   ├── startup-assets.ts
│   └── startup-errors.ts
├── client/
│   └── index.ts
└── style.css

/Users/nick/code/template-hono-spa/test/
├── integration.spec.ts
├── unit.spec.ts
└── migration-rendering.spec.ts

/Users/nick/code/template-hono-spa/
├── package.json
├── wrangler.jsonc
└── wrangler.test.jsonc
```

**Structure Decision**: Keep the current single-project layout. Implementation should stay centered on `src/server/startup-assets.ts` and the shell rendering path in `src/server/index.ts`, with regression coverage in the existing unit and integration test files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified.
