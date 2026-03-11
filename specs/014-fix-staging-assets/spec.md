# Feature Specification: Staging Asset Loading Reliability

**Feature Branch**: `014-fix-staging-assets`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "It works locally, but when I deploy to staging branch css and js are 404 [Image #1]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load staging assets successfully (Priority: P1)

As a reviewer opening the staging site, I want the page to load its stylesheet and client script successfully so the app appears styled and interactive instead of broken.

**Why this priority**: This is the reported failure and the primary user-visible problem.

**Independent Test**: Open the staging home page in a fresh browser session and confirm the first-page load completes without missing CSS or JavaScript requests.

**Acceptance Scenarios**:

1. **Given** a staging deployment is available, **When** a reviewer opens the site, **Then** the page loads valid stylesheet and client-script URLs and the app renders normally.
2. **Given** a staging deployment contains the expected build assets, **When** the shell page is generated, **Then** it references asset URLs that exist in that deployment.

---

### User Story 2 - Preserve working local and non-staging behavior (Priority: P2)

As a developer or production visitor, I want the fix for staging asset loading to avoid breaking environments that already work so the regression stays isolated to the staging problem.

**Why this priority**: Solving staging must not create new failures in local development or other working environments.

**Independent Test**: Load the app locally and in a non-staging deployment path and confirm the shell still returns valid asset references and the app remains usable.

**Acceptance Scenarios**:

1. **Given** the app is running locally, **When** a developer opens it, **Then** the app still loads without missing CSS or JavaScript requests.
2. **Given** a non-staging deployment is working, **When** the same asset-resolution logic runs there, **Then** it continues to reference valid asset URLs.

---

### User Story 3 - Make asset-resolution failures diagnosable (Priority: P3)

As a maintainer, I want asset-resolution failures to be surfaced clearly so I can identify deployment or manifest problems quickly instead of debugging a blank or unstyled page with only browser 404s.

**Why this priority**: Fast diagnosis reduces time-to-repair if asset metadata or deployment output is wrong again.

**Independent Test**: Simulate a missing or invalid asset-manifest condition and confirm the system exposes a clear, actionable failure path instead of silently referencing broken asset URLs.

**Acceptance Scenarios**:

1. **Given** the deployment metadata for client assets is missing or invalid, **When** the shell is generated, **Then** the failure mode is explicit and actionable for maintainers.
2. **Given** the system falls back from primary asset metadata, **When** the fallback asset URLs are emitted, **Then** they must correspond to files that are actually present for that deployment mode.

### Edge Cases

- What happens when the asset manifest exists but points to hashed files that differ from the fallback asset names? The shell must prefer the deploy-valid asset URLs and avoid broken hardcoded references.
- What happens when the asset manifest is missing or unreadable on staging? The failure path must not silently produce asset URLs that 404 in that deployment.
- What happens when the stylesheet is unavailable but the script is present, or vice versa? The resulting output must make the partial asset failure clear enough to diagnose quickly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST generate staging shell pages with CSS and JavaScript asset URLs that exist in the staging deployment.
- **FR-002**: The system MUST resolve asset URLs from the deployment’s available build metadata when that metadata is present and valid.
- **FR-003**: The system MUST avoid emitting fallback asset URLs on staging when those fallback URLs are not deploy-valid for that environment.
- **FR-004**: The system MUST preserve successful asset loading for local development.
- **FR-005**: The system MUST preserve successful asset loading for non-staging environments that already work.
- **FR-006**: The system MUST provide a diagnosable failure path when build metadata is missing, invalid, or inconsistent with deployed assets.
- **FR-007**: The system MUST ensure both the stylesheet reference and the client-script reference are handled consistently by the same asset-resolution rules.

### Key Entities *(include if feature involves data)*

- **Deployment Asset Manifest**: The deployment-specific metadata that identifies the actual CSS and JavaScript files to load.
- **Shell Asset Paths**: The stylesheet and script URLs inserted into the generated HTML shell.
- **Staging Deployment**: The review environment whose deployed asset files must match the shell’s referenced URLs.

### Assumptions & Dependencies

- Staging deployments publish a set of built client assets that can be identified either through deployment metadata or a deployment-valid fallback.
- Local development already works and should remain a known-good reference behavior.
- This feature covers server-side asset-path selection and failure handling, not redesign of the client application itself.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In verification checks, 100% of initial staging page loads complete without 404 responses for the shell’s CSS and JavaScript asset requests.
- **SC-002**: In verification checks, 100% of local page loads continue to complete without 404 responses for the shell’s CSS and JavaScript asset requests.
- **SC-003**: In verification checks, 100% of staging shell responses reference asset URLs that correspond to files present in that deployment.
- **SC-004**: When asset metadata is missing or invalid, maintainers receive an explicit failure signal that identifies asset-resolution as the problem.
