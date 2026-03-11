# Research: Staging Asset Loading Reliability

## Scope

Feature context: staging deployments currently return 404s for the shell’s CSS and JavaScript asset URLs even though local development works.

## Decision 1: Keep asset resolution centralized in startup asset loading

- Decision: Continue resolving deploy-time shell asset paths in the existing startup asset resolver rather than scattering path logic across multiple rendering sites.
- Rationale: The current server flow already funnels shell asset selection through one resolver and one HTML shell output path.
- Alternatives considered:
  - Hardcode staging-only asset paths in shell rendering: rejected because it duplicates logic and risks environment drift.
  - Resolve paths separately for CSS and JavaScript in different places: rejected because it weakens consistency guarantees.

## Decision 2: Align fallback asset paths with actual deploy output

- Decision: Ensure any fallback asset references match files that can actually exist in non-dev deployments.
- Rationale: The current code path can fall back to `/assets/index.css` and `/assets/index.js` while the build output and manifest data indicate client assets are emitted under `/client/`.
- Alternatives considered:
  - Keep current fallback names and rely on deploy-side rewriting: rejected because the browser evidence shows these URLs 404 in staging.
  - Remove fallback behavior entirely: rejected because missing or invalid manifest states still need a controlled recovery or explicit failure path.

## Decision 3: Preserve manifest-first behavior when deployment metadata is valid

- Decision: Keep the manifest as the preferred source of truth for asset references when it is present and valid.
- Rationale: The manifest reflects the actual built file names and is the safest way to reference hashed or environment-specific output.
- Alternatives considered:
  - Ignore manifest data and use a fixed path only: rejected because hashed or build-specific file names may differ across deployments.
  - Depend on directory listing or runtime guessing: rejected because it is less deterministic and harder to test.

## Decision 4: Make manifest fallback or failure diagnosable

- Decision: When manifest resolution fails, produce a result that is explicit enough for maintainers to identify asset-resolution problems quickly.
- Rationale: A silent fallback to invalid paths creates browser-side 404s without making the root cause obvious in the server flow.
- Alternatives considered:
  - Silent failure with broken asset URLs: rejected because it reproduces the current problem.
  - Generic startup failure text with no asset context: rejected because it slows diagnosis.

## Decision 5: Verify at both resolver and request levels

- Decision: Extend unit coverage for startup asset resolution and integration coverage for shell output so the problem is protected end to end.
- Rationale: Resolver tests catch path-selection regressions, while request-level tests confirm the generated HTML points at deploy-valid assets.
- Alternatives considered:
  - Integration tests only: rejected because it makes resolver edge cases harder to isolate.
  - Unit tests only: rejected because the actual user-visible failure is in rendered shell output.

## Clarification Resolution Summary

All technical-context questions are resolved from the current repository state. No `NEEDS CLARIFICATION` markers remain.
