# Contract: Client-Only Route Rendering

## Interface

- **Name**: Page Route Rendering Contract
- **Consumer**: Browser clients and local developers validating route behavior
- **Provider**: Application route handlers
- **Scope**: Primary page routes (for example `/`, `/about`)

## Preconditions

- Application startup command has completed successfully.
- Client assets are available to the running app.

## Guaranteed Behavior

1. Target page routes return an HTML shell suitable for client rendering.
2. Response does not contain server-rendered application UI fragments.
3. Response includes required client asset references and mount container.
4. Startup prerequisite failures return actionable guidance with explicit cause and next step.

## Verification Signals

- Route response includes mount container and client script tag.
- Route response excludes server-rendered app body content for targeted routes.
- Failure responses include both cause and remediation guidance.

## Out of Scope

- API response payload contracts.
- Production deployment packaging details.
