# Feature Specification: Serve index.html as a Static File

**Feature Branch**: `052-serve-index-html`
**Created**: 2026-05-02
**Status**: Draft
**Input**: User description: "The server should serve the `index.html` file. Should not create HTML via inline strings."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Serve the SPA shell from a real HTML file (Priority: P1)

When a visitor loads any client-routed URL of the application, the server
returns the application's HTML shell. That shell is the project's
`index.html` file (the same source that designers, developers, and tooling
edit by hand). The server MUST NOT assemble the HTML response by
concatenating string literals at request time.

**Why this priority**: This is the entire feature. The HTML shell is the
single entry point for every client-rendered route, so its source of
truth needs to be one file that stakeholders can read, edit, lint, and
review. Today the shell is split between an `index.html` file used in
dev and a hand-written string array used in production, which is
duplicated, easy to drift, and not reviewable as HTML.

**Independent Test**: Request the application root (and any deep client
route) from a built/deployed instance. The response body MUST match the
contents of the project's HTML shell file (with build-time asset
references substituted in). Verify by diffing the response against the
shell file and confirming no inline HTML strings remain in server source.

**Acceptance Scenarios**:

1. **Given** the application has been built and deployed, **When** a
   user requests `/`, **Then** the response body is the contents of the
   project's HTML shell file, with the correct hashed CSS and JS asset
   URLs in place of any build-time placeholders.
2. **Given** a user requests a deep client-routed URL such as `/profile`
   that is not an API route or static asset, **When** the server
   responds, **Then** it returns the same HTML shell so the SPA can
   hydrate and render the route.
3. **Given** a developer searches the server source for `<!DOCTYPE` or
   `<html`, **When** they inspect the results, **Then** no
   request-handling code constructs HTML by joining or templating string
   literals.
4. **Given** a designer or developer edits the HTML shell file (for
   example, changing the page `<title>` or adding a meta tag), **When**
   the application is rebuilt and redeployed, **Then** the change
   appears in the served response without any matching change to server
   code.

---

### User Story 2 - Graceful failure when the shell file is unavailable (Priority: P2)

If the HTML shell file cannot be loaded at request time (for example,
because of a deployment configuration problem), the server returns a
clear, human-readable error response instead of a broken page or a
server crash. Operators see enough detail in logs to diagnose and
remediate.

**Why this priority**: The current implementation already handles
startup failures by returning a formatted 500 with remediation guidance.
That behavior must be preserved when the HTML shell becomes a real file
dependency, otherwise this change reduces operational quality.

**Independent Test**: Simulate the shell file being missing or
unreadable. The request to `/` returns a 5xx response whose body
explains the cause and a remediation step, and a corresponding warning
is logged. The process does not crash.

**Acceptance Scenarios**:

1. **Given** the HTML shell file cannot be retrieved, **When** a user
   requests a route that should serve the shell, **Then** the server
   responds with a 5xx status and a plain-text message that names the
   cause and a remediation step.
2. **Given** the shell fails to load, **When** the failure occurs,
   **Then** a warning is written to the server logs that identifies the
   missing shell and the expected location.

---

### Edge Cases

- The shell file references build-time assets (CSS, JS) that are
  rewritten by the bundler with content hashes. The served response
  MUST reflect the production hashed asset paths, not the dev source
  paths.
- In local development, the existing dev workflow (Vite serving the raw
  `index.html` with un-hashed source paths) continues to work without
  regression.
- API routes (e.g. `/api/...`), health checks (`/health`), and static
  asset requests (e.g. `/assets/...`) MUST continue to be handled by
  their existing handlers and MUST NOT be replaced by the shell
  response.
- Requests for unknown static asset paths (e.g. a missing image)
  continue to return the existing not-found behavior, not the SPA shell.
- The response MUST set an HTML content type so browsers render it
  correctly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The server MUST respond to requests for the SPA shell
  (the application root and client-routed URLs) with the contents of
  the project's HTML shell file.
- **FR-002**: Server source code MUST NOT construct the HTML shell
  response by concatenating, joining, or templating HTML string
  literals at request time. The shell is authored in a single `.html`
  file that is the source of truth.
- **FR-003**: The served HTML MUST reference the correct production
  asset URLs (hashed CSS and JS) for the current build, so the SPA
  loads and runs end-to-end.
- **FR-004**: Local development MUST continue to work unchanged: the
  dev workflow (Vite) continues to serve the same shell file with dev
  asset paths.
- **FR-005**: Existing non-shell routes (API endpoints, `/health`,
  static asset routes) MUST continue to be served by their existing
  handlers and MUST NOT be intercepted by the shell handler.
- **FR-006**: When the HTML shell cannot be loaded at request time,
  the server MUST return a 5xx response whose body explains the cause
  and a remediation step, and MUST log a warning describing the
  failure.
- **FR-007**: The response MUST be served with an HTML content type.
- **FR-008**: There MUST be a single source of truth for the HTML
  shell. Editing that one file MUST be sufficient to change the served
  HTML; no parallel edits in server source code should be required.

### Key Entities

- **HTML shell file**: The single hand-authored HTML document that
  defines the SPA's document structure, head metadata, root mount
  point, and references to bundled assets. Source of truth for the
  shell HTML returned by the server.
- **Built asset references**: The hashed CSS and JS URLs that the
  bundler produces at build time and that the served shell must point
  at in production.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A code search of the server source for HTML literals
  (`<!DOCTYPE`, `<html`, `<head>`, `<body>`) returns zero matches in
  request-handling code.
- **SC-002**: A request to `/` on a built/deployed instance returns a
  response whose body, after asset-path substitution, is byte-identical
  to the project's HTML shell file.
- **SC-003**: Editing only the HTML shell file (e.g. changing the page
  title or adding a meta tag) and rebuilding produces the change in
  the served HTML, with no server source code change required.
- **SC-004**: All existing automated tests continue to pass, and the
  application's primary user flows (load app, sign in, navigate
  between client routes) work end-to-end on a built/deployed instance
  with no regressions.
- **SC-005**: When the shell file is unavailable, the server responds
  with a 5xx that includes a cause and a remediation step in the body
  in 100% of requests, and never crashes the process.

## Assumptions

- The project already has an HTML shell file at the repo root
  (`index.html`) that the dev server (Vite) consumes today. That same
  file (or a built variant of it produced by Vite) is the intended
  source of truth for production responses as well.
- The production build already emits a built HTML file with hashed
  asset references (today found at `public/client/index.html`).
  Reusing that built file is acceptable, since the bundler is
  responsible for inlining the correct asset hashes.
- Local development continues to use Vite's dev server semantics; the
  changed handler only needs to behave correctly in built/deployed
  environments.
- The existing logic for deciding which paths should serve the shell
  (vs. API/static-asset routes) is correct and is out of scope for
  this change.
