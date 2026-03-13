# Data Model: Vite 8 Config Compatibility

## Entity: ViteRuntimeConfig

- **Purpose**: Represents the effective Vite configuration used by the project for local development and production builds.
- **Fields**:
  - `developmentSettings`: server and plugin settings used during local startup
  - `buildSettings`: output, manifest, minification, and source-map behavior used during production builds
  - `cssPipelineSettings`: stylesheet transformation and target settings used across modes
  - `aliasSettings`: dependency-resolution rules that vary by environment
- **Validation rules**:
  - The configuration must be accepted by Vite 8 without startup or build rejection
  - Development and build settings must remain internally consistent across modes
  - Compatibility-sensitive settings must stay explicit enough for maintainers to identify

## Entity: WorkflowCompatibilityResult

- **Purpose**: Captures whether a standard repository workflow still behaves correctly after the config adjustment.
- **Fields**:
  - `workflowName`: local start, production build, lint, or test
  - `status`: pass or fail
  - `failureType`: configuration rejection, runtime incompatibility, asset mismatch, or none
  - `observedOutput`: high-level observable result of the workflow
- **Validation rules**:
  - `status` must be pass for local start and production build before the feature is complete
  - `failureType` must clearly distinguish config issues from unrelated failures
  - `observedOutput` must reflect the behavior contributors actually rely on

## Entity: BuildArtifactExpectation

- **Purpose**: Defines the generated outputs that must remain stable enough for the current runtime flow after the Vite 8 configuration update.
- **Fields**:
  - `outputDirectory`: expected build destination
  - `manifestAvailability`: whether the expected manifest is generated and readable
  - `clientAssetAvailability`: whether client entry assets remain available
  - `runtimeCompatibility`: whether the server/runtime continues to resolve built assets successfully
- **Validation rules**:
  - Output location must remain aligned with the current deployment and startup asset lookup flow
  - Manifest availability must remain compatible with existing runtime expectations
  - Client assets must remain consumable by the current app shell

## State Transitions

1. **Pre-Fix State**: The repository depends on Vite 8, but the config may contain settings or shapes that no longer behave correctly.
2. **Adjusted Config State**: Compatibility-sensitive settings are updated to the accepted Vite 8 form.
3. **Validated Development State**: Local startup completes without configuration-related errors.
4. **Validated Build State**: Production build completes and still produces artifacts consumable by the existing runtime flow.
