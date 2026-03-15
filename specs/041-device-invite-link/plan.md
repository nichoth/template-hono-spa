# Implementation Plan: Device Invite Link

**Branch**: `041-device-invite-link` | **Date**: 2026-03-14
| **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from
`/specs/041-device-invite-link/spec.md`

## Summary

Replace the existing same-device "Add device" flow with an
invitation-link flow. An authenticated passkey user generates
a short-lived invitation from their profile page, producing a
URL like `/:handle/add/:code` (6-digit numeric code). The new
device visits this URL, completes a WebAuthn registration
ceremony, and the credential is saved to the user's account.
The profile page shows pending invitations with cancel support
and a copy-to-clipboard button for sharing the link.

## Technical Context

**Language/Version**: TypeScript (ES2022 target)
**Primary Dependencies**: Hono (server), Preact + Signals
(client), `@simplewebauthn/server` and
`@simplewebauthn/browser`, `@substrate-system/*` component
library (button, copy-button, input, routes, state)
**Storage**: Cloudflare D1 (SQLite)
**Testing**: Vitest with `@cloudflare/vitest-pool-workers`
**Target Platform**: Cloudflare Workers (server),
modern browsers (client)
**Project Type**: Web application (SPA + API)
**Constraints**: 80-column line width, no space between
colon and type annotations, `htm/preact` template literals

## Constitution Check

*Constitution is unpopulated (template only). No gates to
evaluate.*

## Project Structure

### Documentation (this feature)

```text
specs/041-device-invite-link/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── device-invite-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (affected files)

```text
src/
├── server/
│   ├── index.ts              # New API routes + invite
│   │                         # claim routes
│   ├── auth/
│   │   └── index.ts          # New invite service methods
│   └── db/
│       ├── schema.ts         # New device_invitations table
│       └── index.ts          # New DB helpers for invites
│
├── client/
│   ├── state.ts              # New invite signals + actions
│   └── routes/
│       ├── index.ts          # New /:handle/add/:code route
│       ├── profile.ts        # Replace add-device UI with
│       │                     # invite flow
│       ├── profile.css       # Styles for invite UI
│       ├── claim-device.ts   # NEW: invitation claim page
│       └── claim-device.css  # NEW: claim page styles
│
test/
└── integration.spec.ts       # Invite flow tests
```

**Structure Decision**: Follows the existing project layout.
New client route `claim-device.ts` mirrors the pattern of
`confirm.ts` (a page visited via a unique token URL). Server
changes extend the existing `auth/index.ts` service and
`db/index.ts` helpers.

## Key Design Decisions

### 1. Invitation Code Format

6-digit numeric string (e.g., `482901`). Generated randomly.
Unique constraint in DB prevents collisions. Short enough
to type manually if needed. Combined with 15-minute expiry
and authenticated-user-only generation, brute-force risk
is low.

### 2. URL Structure

`/:handle/add/:code` — e.g., `/alice/add/482901`.

The handle provides human-readable context. The server's
catch-all `GET *` already serves the SPA shell for this
path. The client router matches the pattern and renders
`ClaimDeviceRoute`.

The server needs a `shouldServeShell` adjustment to ensure
paths like `/alice/add/482901` are treated as SPA routes,
not static assets. This should already work since the path
has no file extension, but we need to verify.

### 3. Separate Table vs. Reusing auth_challenges

New `device_invitations` table. See research.md R2 for
rationale. The invitation has different semantics (short
code, device name, status lifecycle) than a WebAuthn
challenge.

### 4. Two-Phase Claim Flow

The invitation claim uses the existing WebAuthn
start/finish pattern:
- `POST /api/.../claim/start` — validates invite, generates
  WebAuthn options
- `POST /api/.../claim/finish` — verifies credential, saves
  device, marks invite consumed

This mirrors `startDeviceRegistration` /
`finishDeviceRegistration` but uses the invite code instead
of a session cookie for authorization.

### 5. Replacing the Existing Add-Device Flow

The current `State.addDevice` (which triggers WebAuthn on
the current browser) is replaced. The "Add device" button
now calls `State.createInvite` which returns a URL. The
`startDeviceRegistration` / `finishDeviceRegistration`
server methods can be removed or repurposed.

### 6. Pending Invitation Display

After generating an invitation, the profile page shows
the invite URL inline with a copy button
(`@substrate-system/copy-button`). Pending invitations
are listed with their device name, expiration time, and
a cancel button.

## Complexity Tracking

No constitution violations to justify.
