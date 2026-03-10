# Quickstart: Staging Deploy Basic Authentication

## Prerequisites
- Repository at `/Users/nick/code/template-hono-spa`
- Dependencies installed via `npm install`
- Runtime secrets/config values available for staging basic-auth credentials

## Implementation Steps
1. Add deployment-context detection for main vs non-main traffic.
2. Add request gate logic requiring basic auth for protected environments.
3. Ensure valid credentials allow normal route/API flow.
4. Ensure unauthorized requests return auth challenge semantics.
5. Add integration coverage for main/staging auth behavior.

## Verification Commands
1. Run tests:
   - `cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test`
2. Run lint:
   - `cd /Users/nick/code/template-hono-spa && npm run lint`

## Manual Verification Checklist
1. Hit staging URL without credentials and confirm challenge response:
   - `curl -i -H 'x-deploy-branch: staging' http://127.0.0.1:9999/`
2. Retry staging URL with valid credentials and confirm normal app load:
   - `curl -i -H 'x-deploy-branch: staging' -u staging-user:staging-pass http://127.0.0.1:9999/`
3. Hit main URL without credentials and confirm no challenge appears:
   - `curl -i -H 'x-deploy-branch: main' http://127.0.0.1:9999/`
4. Verify invalid staging credentials continue to deny access:
   - `curl -i -H 'x-deploy-branch: staging' -u staging-user:wrong-pass http://127.0.0.1:9999/`

## Completion Criteria
- FR-001 through FR-007 are satisfied.
- SC-001 through SC-004 are satisfied.
- No unresolved clarifications remain in planning artifacts.
