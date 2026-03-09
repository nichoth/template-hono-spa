# Contract: Local Development Startup

## Interface

- **Name**: Local Startup Command Contract
- **Consumer**: Repository contributors/developers
- **Provider**: Project startup workflow invoked by npm scripts
- **Entry Command**: `npm start`

## Preconditions

- Dependencies are installed.
- Command is run from repository root.
- No pre-generated `public/` output is required.

## Guaranteed Behavior

1. Command starts local development server without requiring manual generation of build-only artifacts.
2. Root page responds with an HTML shell for client rendering (`<div id="root"></div>`), not server-rendered app markup.
3. If startup cannot proceed, output includes:
   - clear cause of failure,
   - at least one concrete remediation command/step.

## Failure Contract

- Failures must be explicit and actionable.
- Ambiguous missing-file stack traces without remediation are contract violations.

## Verification Signals

- Startup process reaches serving state and root route returns HTTP 200, or
- Startup exits with actionable message as defined above.
