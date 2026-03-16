# Feature Specification: Timing-Safe Basic Auth Comparison

**Feature Branch**: `044-timing-safe-basic-auth`
**Created**: 2026-03-16
**Status**: Draft
**Input**: Fix basic auth credentials compared with === (not timing-safe)

## Overview

The staging environment is protected by HTTP Basic Authentication. The
current credential check uses JavaScript's `===` operator to compare
the submitted username and password against the expected values. String
equality in JavaScript is not guaranteed to run in constant time — it
can short-circuit as soon as the first differing character is found.
This creates a timing side-channel: an attacker can measure response
times to infer characters of the password one at a time.

The fix replaces the `===` comparison with a constant-time byte
comparison so that response time reveals no information about whether
or how many characters matched.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Valid credentials are accepted (Priority: P1)

A developer or administrator submits the correct staging username and
password in the `Authorization` header and gains access to the
protected staging environment.

**Why this priority**: This is the primary success path. If valid
credentials are rejected the staging environment becomes inaccessible.

**Independent Test**: Send a request with correct credentials; the
server must return the requested resource, not a 401.

**Acceptance Scenarios**:

1. **Given** a request with the correct username and password,
   **When** the Basic Auth middleware runs,
   **Then** the request proceeds and returns 200.
2. **Given** credentials that differ only in case from the expected
   values, **When** the middleware runs, **Then** the request is
   rejected with 401 (comparison is case-sensitive).

---

### User Story 2 - Invalid credentials are rejected (Priority: P1)

A request with an incorrect username or password is rejected with a
401 response, indistinguishable in behavior from the current
implementation.

**Why this priority**: Security gate — must reject invalid credentials
reliably regardless of which character is wrong.

**Independent Test**: Send requests with wrong password; all must
receive 401.

**Acceptance Scenarios**:

1. **Given** a request with the correct username but wrong password,
   **When** the middleware runs, **Then** a 401 is returned.
2. **Given** a request with a wrong username and correct password,
   **When** the middleware runs, **Then** a 401 is returned.
3. **Given** a request with both username and password wrong,
   **When** the middleware runs, **Then** a 401 is returned.

---

### User Story 3 - Response time does not leak credential information (Priority: P2)

An observer measuring response times for requests with different
passwords cannot use timing differences to infer the correct password.

**Why this priority**: This is the security property being fixed. It
is harder to verify in an automated test but is the core motivation
for the change.

**Independent Test**: Multiple requests with passwords that match the
expected value at varying prefix lengths must all take statistically
indistinguishable time to reject.

**Acceptance Scenarios**:

1. **Given** two requests — one with a password sharing a long prefix
   with the correct password and one differing at the first character —
   **When** both are rejected with 401, **Then** response times are
   not statistically distinguishable.

---

### Edge Cases

- What happens when `expectedUsername` or `expectedPassword` is
  undefined (secrets not configured)? Must reject, not crash.
- What happens when the submitted credential is an empty string?
  Must reject without short-circuiting on length alone.
- What if submitted and expected values are different lengths? Must
  still take constant time (no length short-circuit).
- What happens when credentials contain non-ASCII characters?
  The byte comparison must handle arbitrary UTF-8 correctly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST compare submitted credentials against
  expected credentials in constant time, such that response time does
  not vary based on how many characters match.
- **FR-002**: The system MUST reject credentials when either the
  username or password does not match, returning a 401 response.
- **FR-003**: The system MUST reject credentials when `expectedUsername`
  or `expectedPassword` is absent (secrets not configured).
- **FR-004**: The system MUST accept credentials when both username and
  password exactly match the configured values.
- **FR-005**: The constant-time comparison MUST handle inputs of
  differing lengths without short-circuiting on length.
- **FR-006**: All existing behaviour of the Basic Auth middleware
  (header parsing, realm challenge, 401 response format) MUST remain
  unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing automated tests for Basic Auth pass without
  modification.
- **SC-002**: Requests with valid credentials are accepted and requests
  with invalid credentials are rejected, verified by automated test.
- **SC-003**: The credential comparison uses a constant-time primitive
  from the platform cryptography API rather than a language equality
  operator, verifiable by code review.
- **SC-004**: No regression in staging access — authorized users can
  still reach all protected routes after the change is deployed.

## Assumptions

- The server runtime exposes a constant-time byte comparison primitive
  (equivalent to `crypto.subtle.timingSafeEqual`) without requiring a
  third-party polyfill.
- Credentials are always UTF-8 strings. No binary-only secrets are
  expected.
- The fix is scoped to the `credentialsMatch` function in
  `src/server/basic-auth.ts`. No other comparison sites exist in the
  codebase.

## Out of Scope

- Changing the Basic Auth scheme to a different authentication
  mechanism (API keys, OAuth2, etc.).
- Adding brute-force rate limiting to the Basic Auth endpoint.
- Changing how credentials are stored or rotated.
