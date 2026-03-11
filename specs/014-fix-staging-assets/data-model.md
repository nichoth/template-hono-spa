# Data Model: Staging Shell Asset Resolution

## Entity: DeploymentAssetManifest

- Description: Metadata describing the built client assets available for a deployment.
- Fields:
  - `index.html` (entry): Primary shell entry used to derive deploy-valid CSS and JavaScript file paths.
  - `file` (string | optional): JavaScript asset path for the shell entry.
  - `css` (string[] | optional): Stylesheet asset paths associated with the shell entry.
- Validation rules:
  - A valid manifest must contain an `index.html` entry with a JavaScript file path.
  - CSS may be absent, but the resulting shell behavior must remain explicit and diagnosable.

## Entity: ShellAssetPaths

- Description: Final CSS and JavaScript URLs inserted into the generated HTML shell.
- Fields:
  - `css` (string): Stylesheet URL or empty string when no stylesheet is available.
  - `js` (string): Client-script URL.
- Validation rules:
  - In staging, both paths must correspond to deploy-valid files.
  - Fallback values must not point to non-existent deploy paths for the environment.

## Entity: StartupAssetResult

- Description: Result of resolving shell asset paths before HTML generation.
- Fields:
  - `assets` (ShellAssetPaths): The selected shell asset URLs.
  - `recovered` (boolean): Whether the resolver fell back from the primary manifest path.
  - `warning` (string | optional): Diagnostic detail when manifest resolution is missing, invalid, or inconsistent.
- Validation rules:
  - `recovered=false` indicates manifest-driven asset selection succeeded.
  - `recovered=true` requires a fallback path or failure signal that remains deploy-valid and diagnosable.

## Relationships

- `DeploymentAssetManifest` is parsed into `ShellAssetPaths`.
- `ShellAssetPaths` are wrapped in `StartupAssetResult`.
- `StartupAssetResult` drives the CSS and JavaScript URLs inserted by the HTML shell response.

## State Transitions

1. A shell request arrives and startup asset resolution begins.
2. If deployment metadata is available and valid, manifest-derived paths become the shell asset paths.
3. If metadata is missing, invalid, or incomplete, the resolver enters recovery mode.
4. Recovery mode either produces deploy-valid fallback asset paths or emits an explicit diagnostic signal.
5. The shell response renders with the resulting asset path selection.
