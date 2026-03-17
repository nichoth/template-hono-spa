# Implementation Plan: Require Device Name

**Branch**: `043-require-device-name` | **Date**: 2026-03-15 |
**Spec**: [spec.md](./spec.md)
**Input**: Feature specification from
`/specs/043-require-device-name/spec.md`

## Summary

Make the device name field required in the "Add Device" section of the
profile page. The label changes from "Device name (optional)" to
"Device name", and the "Add device" button is disabled until the field
contains at least one non-whitespace character. This is a client-side
UI change only — no server or data-model changes required.

## Technical Context

**Language/Version**: TypeScript (ES2022)
**Primary Dependencies**: Preact + @preact/signals, htm/preact
**Storage**: N/A — no storage changes
**Testing**: npm test (existing test suite)
**Target Platform**: Web browser (SPA)
**Project Type**: Web application (SPA frontend + Hono backend)
**Performance Goals**: Immediate (single-keystroke) UI feedback
**Constraints**: Change confined to
`src/client/routes/profile.ts`
**Scale/Scope**: Single component, two targeted edits

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1
design.*

No project constitution has been defined (constitution.md contains
only the template). No gates to enforce. Proceeding without
violations.

## Project Structure

### Documentation (this feature)

```text
specs/043-require-device-name/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # N/A - no data model changes
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A - no API contract changes
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
└── client/
    └── routes/
        └── profile.ts   # Only file changed
```

**Structure Decision**: Single-file frontend change. No new files
required in the source tree.

## Complexity Tracking

No constitution violations — section not applicable.
