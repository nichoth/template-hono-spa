# Phase 0 Research: Rewrite Navigation Component to JSX

## Research Tasks Dispatched

1. Research JSX authoring conventions already used in this repo for Preact components.
2. Research best practices for safe one-file JSX migrations that preserve route and active-state behavior.
3. Research integration pattern between navigation display data (`routes`) and active-path normalization used in app state.
4. Research validation strategy to catch syntax mismatch regressions (lint + test flow already used by project).

## Decision: Align navigation authoring with existing JSX component pattern in repo

- **Decision**: Implement the navigation component using the same JSX return style and class-binding patterns already present in `src/app.tsx` and `src/client/index.tsx`.
- **Rationale**: This directly satisfies the feature requirement for project-consistent JSX syntax and reduces cognitive overhead for maintainers.
- **Alternatives considered**:
  - Keep template literals and patch syntax issues only: rejected because it does not satisfy the requested migration to JSX.
  - Introduce a new rendering abstraction/helper: rejected as unnecessary complexity for a single-component correction.

## Decision: Preserve navigation behavior and route semantics during syntax migration

- **Decision**: Keep link destinations and active-state matching semantics unchanged while converting render syntax.
- **Rationale**: Functional requirements prioritize no user-facing regressions in navigation and active indicators.
- **Alternatives considered**:
  - Redesign route schema simultaneously: rejected because it expands scope beyond requested fix.
  - Modify active-state logic to pattern/wildcard matching: rejected due behavior-change risk and no requirement to do so.

## Decision: Use existing route definitions as single source of displayed nav items where feasible

- **Decision**: Prefer route metadata already defined in routing modules for link display consistency, or preserve existing static list if routing source is intentionally separate.
- **Rationale**: Prevents label/path drift and supports maintainability requirement.
- **Alternatives considered**:
  - Duplicate labels/paths in multiple files: rejected because duplication increases mismatch risk.
  - Hardcode temporary values for migration speed: rejected because it weakens long-term maintainability.

## Decision: Validate with current repository quality gates

- **Decision**: Use `npm run lint` and `npm test` as primary automated verification, with manual route-click checks as acceptance validation.
- **Rationale**: These are the established project commands and cover syntax consistency plus route behavior confidence.
- **Alternatives considered**:
  - Manual browser checks only: rejected due regression risk.
  - Add heavy new test harness before migration: rejected as disproportionate for this scoped update.

## Clarification Resolution Status

All technical-context uncertainties are resolved for planning scope:
- Authoring style target is repository-standard JSX.
- Behavior scope is non-breaking migration of navigation rendering.
- Validation gates are existing lint/test commands plus scenario checks from spec.
