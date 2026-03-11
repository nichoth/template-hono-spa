# Quickstart: Staging Site Password Protection

## Prerequisites

- Repository at `/Users/nick/code/template-hono-spa`
- Dependencies installed with `npm install`
- Access to staging deployment secrets for the configured username and password

## Implementation Steps

1. Update deployment-context classification so only the staging deployment is marked as protected.
2. Keep the existing Worker auth middleware, but make its gate depend on the revised staging-only classification.
3. Verify production and localhost requests continue to bypass authentication.
4. Extend request-level integration tests to cover staging challenge/success and public-access regressions.
5. Verify Wrangler configuration still provides the required staging secrets and branch metadata.

## Verification Commands

1. Run the automated test suite:
   - `cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test`
2. Run lint:
   - `cd /Users/nick/code/template-hono-spa && npm run lint`

## Manual Verification Checklist

1. Open the staging site in a fresh browser session and confirm a password prompt appears before the app loads.
2. Enter valid staging credentials and confirm the requested page loads normally.
3. Open the production site in a fresh browser session and confirm it loads without a password prompt.
4. Run the app locally and confirm localhost loads without a password prompt.
5. Retry the staging site with invalid credentials and confirm access remains blocked.
6. From a local checkout of the staging branch, confirm `localhost` still opens without a password prompt.

## Completion Criteria

- Staging requests are consistently challenged until valid credentials are provided.
- Production and localhost remain publicly accessible.
- Integration coverage protects the environment-classification and auth-gating behavior from regression.
