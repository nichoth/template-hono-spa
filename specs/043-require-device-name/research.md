# Research: Require Device Name

**Feature**: 043-require-device-name
**Date**: 2026-03-15

## Findings

### Decision: Where to enforce the required constraint

**Decision**: Client-side only, via signal-derived disabled state on
the button.

**Rationale**: The server already accepts the device name. The spec
explicitly states no server-side changes are needed. The existing
`addDeviceName` signal in `profile.ts` already holds the input value,
making a derived disabled condition trivial.

**Alternatives considered**:
- Server-side validation: rejected — spec says no server changes;
  also creates unnecessary round-trips for a simple UX constraint.
- HTML `required` attribute on the input: rejected — would trigger
  browser native validation UI on form submit, but the form uses a
  button `type="button"` (not `type="submit"`), so `required` alone
  would not disable the button. The button disabled approach is more
  direct and consistent with the existing pattern.

### Decision: Whitespace handling

**Decision**: Trim the value before checking — `value.trim() === ''`
means disabled.

**Rationale**: Consistent with the existing `onAddDevice` handler
which already calls `.trim()` before passing the value. A name of
only spaces is not a useful device name.

**Alternatives considered**:
- Raw string check (`value === ''`): rejected — allows a
  space-only name to enable the button, which is confusing.

### Decision: Label text

**Decision**: Change `"Device name (optional)"` → `"Device name"`.

**Rationale**: The simplest, most direct change. No additional hint
text (e.g., asterisk, "required" suffix) is needed for a two-field
form where the constraint is self-evident from the button behavior.

**Alternatives considered**:
- Add asterisk (`Device name *`): unnecessary visual noise for a
  single required field.
- Add inline error message: overkill for this scope.

## Resolved Clarifications

No NEEDS CLARIFICATION markers were present in the spec. All
decisions above are based on reading the existing code and
interpreting the spec.
