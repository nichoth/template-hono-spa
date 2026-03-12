# Contract: Shell Asset Loading

## Interface Type

Server-rendered HTML shell asset-reference contract.

## Scope

Defines how the shell HTML chooses and emits CSS and JavaScript asset URLs across staging and non-staging environments.

## Contract Requirements

1. The generated HTML shell must emit CSS and JavaScript URLs that correspond to files present in the active deployment.
2. When deployment asset metadata is valid, shell asset URLs must be derived from that metadata.
3. When deployment asset metadata is missing or invalid, the system must not silently emit staging asset URLs that 404.
4. Local development must continue to emit valid asset URLs for the development workflow.
5. Failures in asset resolution must be diagnosable from the server-side behavior or emitted failure signal.
6. The default recovery asset paths must remain aligned with the actual deploy output layout used by non-dev builds.

## Acceptance Scenarios

1. Staging with valid manifest:
   - Given a staging deployment with valid asset metadata,
   - When the shell response is generated,
   - Then the HTML references deploy-valid CSS and JavaScript files.
2. Staging with missing manifest:
   - Given a staging deployment without usable asset metadata,
   - When the shell response is generated,
   - Then the system avoids silently emitting broken asset URLs and surfaces a diagnosable failure path.
3. Local development:
   - Given a local development session,
   - When the shell response is generated,
   - Then the HTML continues to reference working development assets.

## Out of Scope

- Client-side routing behavior unrelated to shell asset URLs.
- Visual redesign of the app.
- Deployment platform changes outside asset-path selection and validation.
