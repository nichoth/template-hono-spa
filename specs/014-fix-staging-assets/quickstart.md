# Quickstart: Staging Asset Loading Reliability

## Prerequisites

- Repository at `/Users/nick/code/template-hono-spa`
- Dependencies installed with `npm install`
- Access to build and deploy the staging environment or to simulate deploy asset metadata in tests

## Implementation Steps

1. Review current startup asset resolution and shell HTML asset insertion.
2. Align fallback or recovery asset behavior with deploy-valid output paths.
3. Preserve manifest-driven asset selection when deployment metadata is valid.
4. Add unit coverage for resolver success, fallback, and invalid-manifest scenarios.
5. Add request-level coverage for shell HTML asset references in deploy-like conditions.

## Verification Commands

1. Run tests:
   - `cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test`
2. Run typecheck:
   - `cd /Users/nick/code/template-hono-spa && npm run test:typecheck`
3. Run lint:
   - `cd /Users/nick/code/template-hono-spa && npm run lint`

## Manual Verification Checklist

1. Deploy to staging and open the site with browser devtools open.
2. Confirm the initial CSS and JavaScript requests return successful responses instead of 404s.
3. Confirm the HTML shell references deploy-valid asset URLs for staging.
4. Run the app locally and confirm local asset loading remains unchanged.
5. Simulate a missing or invalid manifest path and confirm the failure is diagnosable.

## Completion Criteria

- Staging no longer emits broken shell asset URLs.
- Local behavior remains intact.
- Resolver and shell-level regression tests protect the fix.
