# Research: Staging Deploy Basic Authentication

## Scope

Feature context: enforce HTTP basic auth on staging/preview deploys while keeping main deploy public for a Cloudflare-backed SPA.

## Decision 1: Gate requests based on deployment environment classification
- Decision: Determine whether request belongs to main or non-main deployment before auth evaluation.
- Rationale: Requirement explicitly differentiates main branch deploy from staging/preview deploys.
- Alternatives considered:
  - Always require auth for all environments: rejected because it breaks public main access.
  - Never require auth and rely on obscurity: rejected because staging protection is required.

## Decision 2: Use standard HTTP basic-auth challenge semantics
- Decision: Return authentication challenge for unauthorized staging requests and allow through on valid credentials.
- Rationale: Matches user request and common browser/server behavior expectations.
- Alternatives considered:
  - Custom form-based auth: rejected (outside requested scope).
  - Token-only headers: rejected (not aligned with explicit basic-auth requirement).

## Decision 3: Source credentials from deployment secrets
- Decision: Read expected username/password (or combined secret value) from secure runtime configuration.
- Rationale: Avoids hardcoded secrets and supports environment-specific credential management.
- Alternatives considered:
  - Hardcode credentials in source: rejected for security risk.
  - Store credentials in client bundle: rejected because secrets must remain server-side.

## Decision 4: Protect all relevant request paths in staging
- Decision: Apply access control consistently to SPA shell routes and API surfaces served by backend unless explicitly exempted.
- Rationale: Prevents bypass through alternate route families.
- Alternatives considered:
  - Guard only root path: rejected due to route-bypass risk.
  - Guard only API endpoints: rejected due to exposed app shell.

## Decision 5: Verification approach
- Decision: Extend request-level integration tests for main vs staging behavior and auth success/failure branches.
- Rationale: Existing integration tests already exercise worker request handling; this adds focused security checks.
- Alternatives considered:
  - Manual verification only: rejected due to regression risk.
  - Unit-only validation: rejected because behavior depends on request/response path integration.

## Clarification Resolution Summary

All Technical Context unknowns are resolved; no `NEEDS CLARIFICATION` markers remain.
