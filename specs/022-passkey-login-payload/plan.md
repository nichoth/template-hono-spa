# Implementation Plan: Passkey Login Request Contract

**Branch**: `022-passkey-login-payload` | **Date**: 2026-03-13 | **Spec**: [/Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/spec.md](/Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/spec.md)
**Input**: Feature specification from `/specs/022-passkey-login-payload/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Define the client/server contract for passkey login so `State.login` can submit the correct data to the server and interpret the response boundary without guesswork. The implementation plan will stay focused on the current client login flow, the request payload needed after a passkey assertion is produced, and the success/failure response categories that the client state layer must understand.

## Technical Context

**Language/Version**: TypeScript (ES2022 strict mode), browser WebAuthn/browser credential objects, JSON request/response payloads  
**Primary Dependencies**: Preact signals app state, `ky` for HTTP requests, current login route UI, Hono-backed API routes, existing request-state helpers  
**Storage**: N/A on the client; request/response contract only  
**Testing**: Vitest worker tests, source-contract assertions, integration checks for login route and API behavior  
**Target Platform**: Browser SPA client talking to the repository’s API server  
**Project Type**: web application  
**Performance Goals**: Make passkey login request construction deterministic and lightweight enough for immediate client submission after a passkey assertion is produced  
**Constraints**: Keep scope limited to the `State.login` request/response contract, preserve the current UI-only login flow boundary until server integration is implemented, do not broaden into full authentication persistence or session architecture, and avoid sending unnecessary client/device data  
**Scale/Scope**: One client state method, the current login route’s passkey path, one API login boundary, and contract documentation for required request and response fields

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The current [constitution.md](/Users/nick/code/template-hono-spa/.specify/memory/constitution.md) is still an unfilled template with placeholder sections and no ratified repository-specific rules.
- Planning gate status: PASS by default because there are no enforceable constitutional requirements defined yet.
- Operational repository gates still apply for implementation:
  - Keep the work bounded to passkey login contract definition and `State.login` integration needs.
  - Preserve the current route/UI boundary while clarifying only the request and response payload contract.
  - Validate any later implementation with repository-standard checks, but do not assume server behavior that is not documented.
- Post-design re-check: PASS. The Phase 0 and Phase 1 artifacts remain within the login contract boundary and introduce no new governance concerns.

## Project Structure

### Documentation (this feature)

```text
specs/022-passkey-login-payload/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── passkey-login-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── state.ts
│   └── routes/
│       └── login.ts
└── server/
    └── index.ts

test/
├── integration.spec.ts
└── unit.spec.ts
```

**Structure Decision**: Keep the existing single-project web application structure. This feature is centered on the client state layer, the current login route contract, and the login API boundary.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
