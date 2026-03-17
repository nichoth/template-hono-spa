# Specification Quality Checklist: Show Revoked Devices in Profile

**Purpose**: Validate specification completeness and quality before proceeding
to planning
**Created**: 2026-03-17
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Scope is narrow and well-bounded: display-only change to the /profile device
  list.
- No clarifications were needed; all decisions have clear reasonable defaults.
- Ready to proceed to `/speckit.plan`.

## Manual verification

- Visit `/profile` while signed in with a passkey account that has at least one active and one revoked device; confirm every device appears in the list, revoked rows show the "Revoked" label with reduced opacity, and the current device indicator still renders for the active entry.
- Visit `/profile` with revoked devices and verify that revoked entries have no "Revoke" button while active entries still show the button, including the guardrails for the current device and being the only remaining active device.
