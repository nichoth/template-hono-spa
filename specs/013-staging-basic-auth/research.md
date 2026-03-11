# Research: Staging Site Password Protection

## Scope

Feature context: require HTTP basic authentication only on the dedicated staging deployment, while keeping the production deployment and localhost development access public.

## Decision 1: Reuse the existing Worker auth middleware path

- Decision: Keep access control in the existing top-level Worker middleware rather than introducing a separate route-specific gate.
- Rationale: The current request pipeline already resolves deployment context before routing and is the narrowest place to enforce a site-wide rule consistently.
- Alternatives considered:
  - Add auth checks separately to API and HTML routes: rejected because it duplicates logic and increases bypass risk.
  - Add client-side authentication flow: rejected because the feature is request protection, not user account management.

## Decision 2: Narrow protection from “all non-main” to “staging only”

- Decision: Update environment classification so only the dedicated staging deployment requires credentials by default.
- Rationale: The revised feature spec explicitly protects the staging subdomain and explicitly exempts production and localhost.
- Alternatives considered:
  - Keep protecting all non-main environments: rejected because it exceeds the stated scope.
  - Remove deployment classification and gate by hostname strings only in multiple places: rejected because centralized classification is easier to reason about and test.

## Decision 3: Keep credentials in deployment secrets

- Decision: Continue sourcing the staging username and password from runtime secrets rather than code or client-visible configuration.
- Rationale: The repo already defines secret names for staging, and this keeps credentials out of source control and browser-delivered assets.
- Alternatives considered:
  - Hardcode credentials in source: rejected for obvious security reasons.
  - Store credentials in client configuration: rejected because secrets must not be exposed to end users.

## Decision 4: Preserve localhost as an always-open development environment

- Decision: Treat local development as unprotected regardless of the staging rule.
- Rationale: The feature spec explicitly excludes localhost, and local development should stay frictionless for routine testing.
- Alternatives considered:
  - Mirror staging auth locally: rejected because it would slow development and is not requested.
  - Require developers to pass local override headers during normal dev: rejected because it complicates the standard workflow.

## Decision 5: Verify behavior with request-level integration tests

- Decision: Extend the existing Worker integration suite to cover staging challenge, staging success, production open access, and localhost open access regression behavior.
- Rationale: The current test harness already exercises the Worker with deployment-branch headers and runtime env values, making it the most direct regression safety net.
- Alternatives considered:
  - Unit tests only: rejected because the feature depends on middleware ordering and request/response behavior.
  - Manual verification only: rejected because it would not protect against future regressions.

## Clarification Resolution Summary

All technical-context questions are resolved from the current repository state. No `NEEDS CLARIFICATION` markers remain.
