# Implementation Plan: Add Passkey Device

**Branch**: `040-add-passkey-device` | **Date**: 2026-03-14
**Spec**: [spec.md](./spec.md)
**Input**: Feature specification from
`/specs/040-add-passkey-device/spec.md`

## Summary

Allow authenticated passkey users to register additional
WebAuthn credentials (devices) to their existing account,
view their registered devices, name them, and revoke them.
The backend already has device persistence, listing, and
revocation. This feature adds:

1. A new "add device" registration ceremony for
   authenticated users (server + client)
2. A client-side device management UI on the profile page
3. Guard rails: session-gated access, duplicate rejection,
   10-device cap, last-device protection

## Technical Context

**Language/Version**: TypeScript (ESM)
**Primary Dependencies**: Hono (server), Preact + Signals
(client), @simplewebauthn/server + @simplewebauthn/browser
**Storage**: Cloudflare D1 (SQLite)
**Testing**: Vitest + @cloudflare/vitest-pool-workers
**Target Platform**: Cloudflare Workers (server),
modern browsers (client SPA)
**Project Type**: Web application (Hono API + Preact SPA)
**Performance Goals**: Standard web app expectations
**Constraints**: D1 row-level operations only (no
transactions), session cookie auth
**Scale/Scope**: Single-user passkey management (max 10
devices per account)

## Constitution Check

*GATE: Must pass before Phase 0 research.
Re-check after Phase 1 design.*

Constitution file is an unfilled template -- no project
principles have been ratified. No gates to enforce.
Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/040-add-passkey-device/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- add-device-contract.md
+-- checklists/
|   +-- requirements.md
+-- spec.md
```

### Source Code (repository root)

```text
src/
+-- server/
|   +-- index.ts          # Hono routes (add new endpoints)
|   +-- auth/
|   |   +-- index.ts      # Auth service (add device methods)
|   +-- db/
|       +-- index.ts      # DB helpers (count devices query)
|       +-- schema.ts     # Schema (no changes needed)
+-- client/
    +-- state.ts           # Client state (add device actions)
    +-- routes/
        +-- profile.ts     # Profile UI (add device mgmt)
        +-- profile.css    # Profile styles

test/
+-- unit.spec.ts
+-- integration.spec.ts
```

**Structure Decision**: This project uses a flat
server/client split under `src/`. New code slots into
existing files. No new directories or modules needed.
