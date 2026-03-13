# Phase 0 Research: Vite 8 Config Compatibility

## Decision 1: Treat the work as a configuration-compatibility fix, not a broad toolchain migration

- **Decision**: Limit the feature to changes required for `vite.config.js` and related validation flows to work cleanly with Vite 8.
- **Rationale**: The repository is already pinned to `vite ^8.0.0` in `package.json`, so the user request is about making the existing configuration compatible rather than planning a package-version upgrade.
- **Alternatives considered**:
  - Fold in wider dependency refreshes at the same time: rejected because it broadens risk and obscures whether the config fix solved the actual issue.
  - Revert to an older Vite version temporarily: rejected because it avoids the requested compatibility goal.

## Decision 2: Preserve the current runtime contract while replacing only config patterns that Vite 8 rejects or handles differently

- **Decision**: Keep the existing dev server entry point, Cloudflare integration, manifest generation, and public output layout unless a specific setting must change for Vite 8 compatibility.
- **Rationale**: The spec focuses on keeping local development and production build behavior stable. The safest plan is to preserve the current contract and adjust only the configuration seam.
- **Alternatives considered**:
  - Restructure the build output or switch runtime integration patterns during the same change: rejected because that would add unrelated behavioral churn.
  - Rewrite the config into a new format for readability alone: rejected because it increases review surface without directly solving compatibility.

## Decision 3: Disable the Cloudflare inspector port in the Vite plugin configuration

- **Decision**: Configure the Cloudflare Vite plugin with `inspectorPort: false` so local startup does not require binding the default inspector port.
- **Rationale**: Reproducing `npm start` showed the current startup blocker was an inspector-port bind attempt, not the core app server port. Disabling the inspector is a narrow configuration fix that preserves the existing dev entry point.
- **Alternatives considered**:
  - Change the main dev server port: rejected because the failure is not on the app port.
  - Accept the inspector bind attempt and treat it as environment-specific noise: rejected because it blocks local startup in constrained environments.

## Decision 4: Use existing automated project commands as the primary validation contract

- **Decision**: Validate the change through the repository’s established commands: `npm start`, `npm run build`, `npm run lint`, and `HOME=/tmp npm test`.
- **Rationale**: The feature is about preserving developer and build workflows. Those workflows are already encoded in project scripts and tests, so they are the correct regression seam.
- **Alternatives considered**:
  - Add a separate one-off config smoke script: rejected because it duplicates the commands contributors already use.
  - Rely on static config inspection alone: rejected because compatibility issues often surface only when the dev server or build actually runs.

## Decision 5: Document the compatibility-sensitive configuration contract explicitly

- **Decision**: Capture the expected dev/build behavior and configuration boundaries in a dedicated feature contract and quickstart guide.
- **Rationale**: Vite major-version config breakages are easy to reintroduce later if the acceptable behavior is only implied by code changes.
- **Alternatives considered**:
  - Leave the rationale only in code comments: rejected because reviewers and future maintainers also need feature-level intent outside the config file.
  - Depend entirely on test names to explain the change: rejected because tests describe regression checks, not the full compatibility contract.
