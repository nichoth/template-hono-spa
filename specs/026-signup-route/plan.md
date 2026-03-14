# Implementation Plan: Signup Navigation And Confirmation

**Branch**: `[026-signup-route]` | **Date**: 2026-03-13 | **Spec**: [/Users/nick/code/template-hono-spa/specs/026-signup-route/spec.md](/Users/nick/code/template-hono-spa/specs/026-signup-route/spec.md)
**Input**: Feature specification from `/specs/026-signup-route/spec.md` plus clarified requirements for a top-nav `Create Account` link, `/signup` form parity with login, and post-submit email confirmation messaging

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a top-level `Create Account` navigation link that routes to `/signup`, align the signup screen with the login route’s passkey/password method selector, and change successful signup handling so the user is told to confirm their email address instead of being treated as fully signed in. The implementation will reuse the existing client-side route structure and signup screen, extend the centralized nav metadata, and update the registration contract across client state, signup UI, and backend auth responses.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (ES2022, strict mode) and CSS via Vite 8  
**Primary Dependencies**: Preact, `htm/preact`, `@preact/signals`, `@substrate-system/routes`, `@substrate-system/radio-input`, Hono, `ky`, `@simplewebauthn/browser`, `@simplewebauthn/server`  
**Storage**: Cloudflare D1 auth tables already used for users, challenges, credentials, sessions, and auth events  
**Testing**: Vitest 3 worker tests in `/Users/nick/code/template-hono-spa/test/*.spec.ts`; ESLint via `npm run lint`  
**Target Platform**: Browser-rendered SPA served by Hono/Cloudflare Workers  
**Project Type**: Web application  
**Performance Goals**: Preserve current client-side navigation responsiveness and keep signup interactions within standard form-submission expectations for a public auth screen  
**Constraints**: Keep the `/signup` route client-side; use the existing login route as the UX baseline; expose `Create Account` in both desktop and mobile nav through centralized route metadata; successful signup must lead to email-confirmation guidance instead of an authenticated session state  
**Scale/Scope**: Public auth experience only; expected touch points are route metadata, nav rendering, signup UI/CSS, client auth state, server registration endpoints, and targeted tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `/Users/nick/code/template-hono-spa/.specify/memory/constitution.md` is still an unfilled template with placeholder content and no enforceable project-specific rules.
- Result: no concrete constitutional gates are defined, so there are no actionable blockers for Phase 0.
- Practical checks applied instead: keep scope constrained to auth navigation/signup behavior, preserve client-side routing, and verify through the repo’s existing lint/test flow.
- Phase 1 re-check result: still passes; the design extends existing auth flows and avoids introducing unrelated architecture.

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
│   │   ├── nav.css
│   │   └── nav.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── login.ts
│   │   ├── signup.css
│   │   └── signup.ts
│   └── state.ts
├── server/
│   ├── auth/
│   │   └── index.ts
│   └── index.ts
└── style.css

test/
├── integration.spec.ts
├── migration-rendering.spec.ts
└── unit.spec.ts
```

**Structure Decision**: This is a single web application with shared client and server code under `/Users/nick/code/template-hono-spa/src`. The feature should stay within the existing auth/nav files and the current Vitest specs under `/Users/nick/code/template-hono-spa/test`, rather than introducing a new frontend/backend split.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
