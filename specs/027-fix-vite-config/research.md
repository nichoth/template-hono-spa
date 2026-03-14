# Phase 0 Research: Vite Dependency Optimization Warning Fix

## Decision 1: Treat the work as a targeted local-start configuration fix

- **Decision**: Limit the feature to configuration and verification changes required to remove the reported `npm start` dependency-optimization deprecation warning.
- **Rationale**: The user request is specific to standard local startup. Keeping the scope tight avoids mixing this warning fix with broader build-tool refactors or dependency upgrades.
- **Alternatives considered**:
  - Broaden the work into a full Vite configuration cleanup: rejected because it increases review surface and risk without directly addressing the reported warning.
  - Ignore the warning as non-blocking: rejected because persistent startup warnings reduce trust in the local workflow and indicate unsupported configuration.

## Decision 2: Preserve the existing startup contract while replacing the deprecated optimization path

- **Decision**: Keep `npm start` as the entry point and preserve the current dev-server behavior, while updating the configuration surface so it no longer depends on the deprecated `optimizeDeps.esbuildOptions` path.
- **Rationale**: The fix is only successful if startup remains functionally unchanged for developers after the warning is removed.
- **Alternatives considered**:
  - Introduce a new startup command or workaround: rejected because the spec explicitly keeps the current command contract.
  - Accept changed route or asset behavior as long as the warning disappears: rejected because that would trade a configuration warning for a workflow regression.

## Decision 3: Investigate both local config and plugin-provided config seams

- **Decision**: Plan the implementation to verify whether the deprecated option is coming from `vite.config.js`, merged config, or a plugin, and adjust the supported configuration seam that actually triggers the warning.
- **Rationale**: The repository does not currently declare `optimizeDeps` in `vite.config.js`, so the deprecation may be introduced indirectly. The implementation must target the real source instead of applying a speculative config edit.
- **Alternatives considered**:
  - Assume the warning comes only from a visible local config block: rejected because that assumption is contradicted by the current config file.
  - Replace unrelated top-level config options preemptively: rejected because it risks collateral changes without evidence.

## Decision 4: Use existing developer commands as the regression contract

- **Decision**: Validate the fix through the established commands that define normal contributor behavior: `npm start`, `npm run lint`, and `HOME=/tmp npm test`.
- **Rationale**: The feature is about restoring confidence in the normal local workflow, so the repository's existing commands are the correct validation seam.
- **Alternatives considered**:
  - Add a one-off script that only checks config parsing: rejected because it duplicates the behavior contributors already rely on.
  - Rely on source inspection alone: rejected because the warning manifests during actual startup.

## Decision 5: Document the warning-removal contract explicitly

- **Decision**: Capture the expected startup behavior, supported configuration boundary, and verification expectations in a dedicated feature contract and quickstart.
- **Rationale**: Configuration regressions are easy to reintroduce when the intent is only implied by code changes. A small contract reduces that risk.
- **Alternatives considered**:
  - Keep all rationale solely in code comments: rejected because planning artifacts should explain the observable contract, not just low-level edits.
  - Depend entirely on test names to document intent: rejected because tests alone do not define the full operational boundary.
