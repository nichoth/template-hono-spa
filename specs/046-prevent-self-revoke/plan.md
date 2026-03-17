# Implementation Plan: Prevent Self-Revoke

**Branch**: `046-prevent-self-revoke` | **Date**: 2026-03-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/046-prevent-self-revoke/spec.md`

## Summary

Prevent users from revoking the device they are currently authenticated
with. The UI revoke button must be disabled for the current device, and
the server must reject any revoke request where the target device matches
the session's device. This replaces the existing confirmation-dialog path
for current-device revocation with a hard block at both layers.

## Technical Context

**Language/Version**: TypeScript (ES2022)
**Primary Dependencies**: Hono (server), Preact + Signals (client)
**Storage**: Cloudflare D1 (SQLite) — no schema changes required
**Testing**: Vitest (`test/unit.spec.ts`)
**Target Platform**: Cloudflare Workers + browser SPA
**Project Type**: Web service + SPA
**Performance Goals**: No new async operations; changes are synchronous
  comparisons
**Constraints**: Must not regress any existing revoke behavior for
  non-current devices
**Scale/Scope**: Small — 3 files touched, ~20 lines changed total

## Constitution Check

No project constitution is defined. No gates to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/046-prevent-self-revoke/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── revoke-device.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── server/
│   ├── auth/
│   │   └── index.ts     # revokeRegisteredDevice — add self-revoke guard
│   └── index.ts         # revoke endpoint — pass currentDeviceId
└── client/
    └── routes/
        └── profile.ts   # disable button + remove dialog for current device

test/
└── unit.spec.ts         # add self-revoke rejection test
```

**Structure Decision**: Single project. Changes are contained to existing
files; no new files added to `src/`.

## Complexity Tracking

No constitution violations. No complexity justification required.
