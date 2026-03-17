# Implementation Plan: Immediate Device Logout on Revocation

**Branch**: `047-revoke-device-logout` | **Date**: 2026-03-16
**Spec**: [spec.md](./spec.md)

## Summary

When a device is revoked, the active session(s) created by that device must be
immediately invalidated. Currently `revokeRegisteredDevice` marks the device
row as `is_revoked = 1` but leaves associated sessions in `status = 'active'`.
The fix is to also revoke all sessions linked to that device (via
`sessions.device_id`) within the same revocation call. Tests must verify that
a session token belonging to a just-revoked device is rejected.

## Technical Context

**Language/Version**: TypeScript (ES2022) + ESM
**Primary Dependencies**: Hono (server), Cloudflare Workers, `@simplewebauthn/server`
**Storage**: Cloudflare D1 (SQLite) — no schema changes required
**Testing**: Vitest with `@cloudflare/vitest-pool-workers`
**Target Platform**: Cloudflare Workers
**Project Type**: Web service (SPA + API)
**Performance Goals**: Standard per-request latency
**Constraints**: D1 batched queries for atomicity where possible
**Scale/Scope**: Single-user app; device count bounded at 10 per user

## Constitution Check

*No project constitution is configured — using general best practices.*

Gates applied:
- [x] No unnecessary abstractions
- [x] No schema changes (reuses existing `sessions.device_id` and
  `sessions.status`)
- [x] Change is minimal and scoped to revocation path only

## Project Structure

### Documentation (this feature)

```text
specs/047-revoke-device-logout/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/server/
├── db/
│   └── index.ts         # Add: revokeSessionsByDeviceId
└── auth/
    └── index.ts         # Update: revokeRegisteredDevice calls
                         #         revokeSessionsByDeviceId

test/
├── unit.spec.ts         # Update: mock-db test for revokeRegisteredDevice
│                        #         — confirm session revocation runs
└── integration.spec.ts  # Add: revoke-then-session test
```

**Structure Decision**: Single project, existing layout. No new files in
`src/` — changes are confined to two existing files and two test files.
