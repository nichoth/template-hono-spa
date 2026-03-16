# Implementation Plan: Indicate Current Device

**Branch**: `045-indicate-current-device` | **Date**: 2026-03-16
**Spec**: specs/045-indicate-current-device/spec.md

## Summary

Two related UI improvements on the Profile page:

1. Show a "(current device)" label next to the device that owns the active
   session.
2. When the user clicks Revoke on their current device, show a confirmation
   dialog (`@substrate-system/dialog`) warning them the action will log them
   out of the current session.

Neither feature exists today. Sessions do not store a `device_id`, so a D1
schema migration (one new nullable column) is needed before the label and
dialog can work correctly.

## Technical Context

**Language/Version**: TypeScript (ES2022)
**Primary Dependencies**: Hono (server), Preact + Signals (frontend),
`@substrate-system/dialog` (v0.0.28, already installed, tag `modal-window`)
**Storage**: Cloudflare D1 — one new nullable column `device_id TEXT` on
`sessions`; migrated via idempotent `ALTER TABLE` in `ensureAuthSchema`
**Testing**: Vitest (`npm test`), ESLint (`npm run lint`)
**Target Platform**: Cloudflare Workers + SPA browser
**Project Type**: Full-stack web service (Hono API + Preact SPA)
**Performance Goals**: No new network requests; one cheap extra column read
**Constraints**: D1 SQLite; no `ADD COLUMN IF NOT EXISTS`; migration must be
idempotent via try/catch on duplicate-column error
**Scale/Scope**: 6 source files touched; no new files except CSS import line

## Constitution Check

Constitution template is unfilled — no gates to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/045-indicate-current-device/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── server/
│   ├── db/
│   │   ├── schema.ts        # Add device_id to sessions CREATE TABLE
│   │   └── index.ts         # SessionRecord type, createSession, migration
│   └── auth/
│       └── index.ts         # SessionResponse type, finishAuthentication,
│                            # getCurrentSession, makeAuthenticatedSessionResponse
└── client/
    ├── state.ts             # Client SessionResponse type
    └── routes/
        ├── profile.ts       # (current device) label + dialog trigger logic
        └── profile.css      # Import dialog CSS; add .device-current style
```

**Structure Decision**: Single project layout; no new source files.

## Complexity Tracking

No constitution violations to justify.
