# Implementation Plan: Passkey device backend

**Branch**: `028-passkey-devices` | **Date**: 2026-03-14 | **Spec**: specs/028-passkey-devices/spec.md  
**Input**: Feature specification from `/specs/028-passkey-devices/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Persist passkey session data in Cloudflare D1 by adding `users` and `devices` tables, then drive registration/authentication/revocation flows through those models so every passkey login resolves the device to the owning user.

## Technical Context

**Language/Version**: TypeScript (ES2022)  
**Primary Dependencies**: Hono, route-event routing utilities, `@cloudflare/workers-types`, `@cloudflare/d1`, and Preact client hooks where needed  
**Storage**: Cloudflare D1 relational database for `users` and `devices` tables  
**Testing**: Vitest 3 with `@cloudflare/vitest-pool-workers` and D1-enabled test harnesses  
**Target Platform**: Cloudflare Workers runtime behind the existing Hono server  
**Project Type**: Serverless web service that exposes auth endpoints and internal routines  
**Performance Goals**: Keep registration and login flows under 200ms at production concurrency (hundreds of auth requests per minute); device listing queries must respond within one second for up to 100 entries  
**Constraints**: D1 does not support multi-statement transactions; counter updates must occur via atomic statements or optimistic locking, and metadata must remain immutable once registered except for timestamps and revocation status  
**Scale/Scope**: Support thousands of users with up to 20 devices each and run automated audits over 100 devices per user without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file currently contains placeholders, so no defined gates can be evaluated at this time. No violations are recorded; re-checking this section post-design will confirm if any governance rules cover passkey data.

## Project Structure

### Documentation (this feature)

```text
specs/028-passkey-devices/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)

```text
src/
├── client/                 # Existing UI; not modified for backend-only work
├── server/
│   ├── auth/               # Authentication handlers referenced by plan
│   └── db/                 # D1 schema helpers and migrations
└── worker-configuration.d.ts

test/                        # Vitest suites for server flows
```

**Structure Decision**: Use the existing `src/server` area to extend authentication/db modules for new tables and flows.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**
