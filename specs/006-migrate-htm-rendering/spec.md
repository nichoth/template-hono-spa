# Feature Specification: Client Rendering Syntax Migration

**Feature Branch**: `006-migrate-htm-rendering`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "Change of plans. I want you to change to `htm` + template literals for all client-side rendering, eg `html`<button...`. See this template repo for more examples: https://github.com/mycelial-systems/template-netlify-app/blob/main/src/components/button.ts"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use one rendering style across client views (Priority: P1)

As a developer, I can build and edit any client-rendered view using a single template-literal rendering style instead of mixed syntaxes.

**Why this priority**: This is the core requested change and gives immediate consistency across the client UI codebase.

**Independent Test**: Inspect client-rendered view modules and confirm they all use the same template-literal rendering style and contain no JSX syntax.

**Acceptance Scenarios**:

1. **Given** a client-rendered component file, **When** a developer opens it, **Then** rendering markup is expressed with template literals rather than JSX tags.
2. **Given** multiple client-rendered view files, **When** they are reviewed together, **Then** they all follow one consistent rendering syntax.

---

### User Story 2 - Preserve existing user-visible behavior during migration (Priority: P2)

As an end user, I still see the same pages, controls, and interactions after the rendering syntax migration.

**Why this priority**: Syntax migration must not regress existing behavior.

**Independent Test**: Run the existing UI validation flow and confirm navigation, controls, and visible content still work as before.

**Acceptance Scenarios**:

1. **Given** a user visiting each existing client route, **When** pages load and navigate, **Then** expected page content remains present.
2. **Given** interactive controls on client pages, **When** users interact with them, **Then** control behavior remains unchanged.

---

### User Story 3 - Align client patterns with reference templates (Priority: P3)

As a maintainer, I can apply the same rendering pattern used in related templates so cross-project maintenance is easier.

**Why this priority**: Pattern consistency across templates reduces cognitive load and speeds future updates.

**Independent Test**: Compare representative client modules against the established template style guide and confirm pattern alignment.

**Acceptance Scenarios**:

1. **Given** a maintainer reviewing client rendering code, **When** they compare it with the reference style, **Then** structure and syntax patterns are aligned.
2. **Given** a new contributor familiar with the reference template, **When** they edit this project’s client rendering code, **Then** they can do so without translating between incompatible markup styles.

### Edge Cases

- How does migration handle conditional content and list rendering? Conditional and repeated content remains readable and functionally equivalent in the new syntax.
- What happens when a file previously mixed helper logic and JSX markup? The file remains functionally intact while rendering syntax is standardized.
- How are small standalone UI fragments handled? Fragments also follow the same template-literal style so no JSX remnants remain in client rendering paths.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Client-rendered view modules MUST use a single template-literal rendering syntax.
- **FR-002**: Client-rendered view modules MUST NOT contain JSX markup syntax.
- **FR-003**: Existing client routes and view content MUST remain available after migration.
- **FR-004**: Existing client interactions (including button actions and navigation) MUST preserve current behavior after migration.
- **FR-005**: Rendering output structure for client pages MUST remain equivalent for current UI expectations.
- **FR-006**: New or updated client rendering modules introduced in this scope MUST follow the same template-literal style for consistency.

### Key Entities *(include if feature involves data)*

- **Client View Module**: A client-rendered file that defines visible UI output for routes or reusable UI components.
- **Rendering Template**: The standardized template-literal expression used to produce client-side UI markup.
- **Behavior Contract**: The expected route content and interaction outcomes that must remain stable through migration.

### Assumptions

- The migration scope is all client-rendered UI code paths in the current project.
- Existing user-facing behavior is already acceptable and should be preserved during syntax conversion.
- Reference template style is used as guidance for consistency, not as a source of additional product features.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of client-rendered view modules in scope use the standardized template-literal rendering syntax.
- **SC-002**: 0 client-rendered view modules in scope contain JSX markup after migration.
- **SC-003**: All currently supported client routes complete existing baseline content checks without regression.
- **SC-004**: At least 95% of sampled interactive client workflows behave identically to pre-migration expectations in validation testing.

## Validation Evidence

- **Date**: 2026-03-10
- **Commands executed**:
  - `HOME=/tmp npm test`
  - `npm run lint`
  - `specs/006-migrate-htm-rendering/scripts/migration-scan.sh`
- **Observed outcomes**:
  - Source scan reports no `.tsx` files under `src/`
  - Server scan reports no JSX return patterns
  - Integration and unit tests pass with migrated `.ts` modules
