# Implementation Plan: Fix Modal Reopen State

**Branch**: `049-fix-modal-reopen` | **Date**: 2026-03-17 | **Spec**:
[spec.md](./spec.md)

## Summary

The revoke confirmation modal cannot be re-opened after being dismissed
because modal visibility is inferred from the `revokeTarget` signal.
When the same device is clicked a second time the signal value does not
change, so the `useEffect` does not re-fire and `modal.open()` is never
called again. The fix introduces a dedicated `revokeDialogOpen` boolean
signal and uses `useSignalEffect` (from `@preact/signals`) to call
`modal.open()` / `modal.close()` whenever that signal changes.

## Technical Context

**Language/Version**: TypeScript (ES2022), ESM
**Primary Dependencies**: Preact, `@preact/signals`, htm/preact,
`@substrate-system/dialog` (ModalWindow)
**Storage**: N/A (client-side state only)
**Testing**: `npm test && npm run lint`
**Target Platform**: Browser SPA (Cloudflare Workers)
**Project Type**: Web application (SPA)
**Performance Goals**: Standard interactive UI responsiveness
**Constraints**: No new dependencies. Minimal code change.
**Scale/Scope**: Single component (`src/client/routes/profile.ts`)

## Constitution Check

The project constitution is a placeholder template with no
project-specific principles. No gates apply. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/049-fix-modal-reopen/
├── plan.md          # This file
├── research.md      # Phase 0 output
└── tasks.md         # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/
└── client/
    └── routes/
        └── profile.ts   # Only file changed
```

**Structure Decision**: Single-file change. No new files, no new
contracts, no data model changes. The fix is entirely within
`profile.ts`.

---

## Phase 0: Research

### research.md
