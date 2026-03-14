# Feature Specification: Vite Dependency Optimization Warning Fix

**Feature Branch**: `027-fix-vite-config`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "In the terminal, when I run `npm start`, it says You or a plugin you are using have set `optimizeDeps.esbuildOptions` but this option is now deprecated. Vite now uses Rolldown to optimize the dependencies. Please use `optimizeDeps.rolldownOptions` instead. Please fix vite config"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Development Without Deprecation Noise (Priority: P1)

As a developer, I want the standard local start command to run without dependency-optimization deprecation warnings so I can trust the project is using supported configuration.

**Why this priority**: `npm start` is the primary entry point for local work. If it emits a configuration warning on every run, it creates confusion and suggests the toolchain is partially broken.

**Independent Test**: Run the normal local start command and confirm startup completes without the deprecated dependency-optimization warning while the application still serves normally.

**Acceptance Scenarios**:

1. **Given** a developer starts the project with the standard development command, **When** the dev server boots, **Then** startup completes without warning that deprecated dependency-optimization options are configured.
2. **Given** a developer starts the project with the standard development command, **When** the server is ready, **Then** the application remains accessible through the expected local address.

---

### User Story 2 - Preserve Existing Local Workflow Behavior (Priority: P2)

As a developer, I want the warning fix to preserve current local development behavior so removing the warning does not introduce new startup regressions.

**Why this priority**: Eliminating a warning is useful only if the existing development workflow keeps working the same way afterward.

**Independent Test**: Start the local workflow after the configuration change and confirm expected startup behavior, route availability, and asset loading still work.

**Acceptance Scenarios**:

1. **Given** the warning fix is in place, **When** the local server starts, **Then** the application routes and assets remain available through the existing workflow.
2. **Given** the warning fix is in place, **When** a developer uses the same project command as before, **Then** no extra manual setup or alternate command is required.

---

### User Story 3 - Keep Configuration Intent Maintainable (Priority: P3)

As a maintainer, I want the dependency-optimization configuration to reflect the current supported approach so future updates do not reintroduce the deprecated setting.

**Why this priority**: This matters after the immediate startup issue is resolved because unclear configuration increases the chance of regression during future toolchain upgrades.

**Independent Test**: Review the relevant configuration and confirm it no longer relies on the deprecated option and remains understandable to a contributor maintaining the build setup.

**Acceptance Scenarios**:

1. **Given** a maintainer reviews the updated configuration, **When** they inspect the dependency-optimization settings, **Then** they can see that the project uses the currently supported option path instead of the deprecated one.
2. **Given** a future contributor updates the build setup, **When** they compare against the fixed configuration, **Then** the supported dependency-optimization approach is clear enough to preserve.

### Edge Cases

- What happens if the local start command succeeds but still emits a dependency-optimization deprecation warning?
- What happens if the warning fix removes the deprecated setting but causes local route serving or asset loading to fail?
- What happens if a plugin still injects the deprecated option and the project must override or align with that behavior?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow developers to run the standard local start command without receiving the deprecated dependency-optimization warning described in the feature request.
- **FR-002**: The system MUST continue to use a supported dependency-optimization configuration path for the local development workflow.
- **FR-003**: The system MUST preserve the existing local startup entry point so developers can continue using the same project command.
- **FR-004**: The system MUST preserve the availability of the application after startup, including normal route and asset delivery during local development.
- **FR-005**: The system MUST avoid introducing new manual workaround steps for contributors when starting local development.
- **FR-006**: The system MUST make the updated configuration clear enough that maintainers can identify which setting avoids the deprecated behavior.

## Assumptions

- The requested scope is limited to resolving the startup warning reported during the standard local development command.
- The desired outcome is to remove the deprecated configuration usage without changing user-facing application behavior.
- Existing development and verification commands remain the expected way contributors interact with the project.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of local startup attempts using the standard development command complete without the reported dependency-optimization deprecation warning.
- **SC-002**: 100% of local startup attempts using the standard development command continue serving the application at the expected local address after the fix.
- **SC-003**: Contributors can verify the warning is resolved and local startup still works in under 5 minutes using existing project commands.
- **SC-004**: The fix introduces 0 additional manual steps for routine local startup.
