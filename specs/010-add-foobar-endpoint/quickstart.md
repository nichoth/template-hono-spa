# Quickstart: Foobar API Endpoint

## Prerequisites
- Repository at `/Users/nick/code/template-hono-spa`
- Dependencies installed (`npm install`)
- Local dev server available (`npm start`) when doing manual checks

## Implementation Steps
1. Add `/api/foobar` route to server route definitions.
2. Return a stable JSON response for successful `GET` requests.
3. Ensure unsupported methods receive non-2xx behavior.
4. Add integration coverage for success, method handling, and non-regression on existing API routes.

## Verification Commands
1. Run lint:
   - `cd /Users/nick/code/template-hono-spa && npm run lint`
2. Run tests:
   - `cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test`

## Manual Verification Checklist
1. Verify success response:
   - `curl -i http://127.0.0.1:8888/api/foobar`
2. Verify unsupported method handling:
   - `curl -i -X POST http://127.0.0.1:8888/api/foobar`
3. Verify non-regression for health endpoint:
   - `curl -i http://127.0.0.1:8888/api/health`

## Completion Criteria
- FR-001 through FR-007 are satisfied.
- SC-001 through SC-004 are satisfied.
- No unresolved clarifications remain in planning artifacts.
