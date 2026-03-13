# Quickstart: Real Passkey Login Backend

## Goal

Validate the real passkey authentication backend end to end, including persisted users, sessions, and required Worker bindings.

## Preconditions

- Auth persistence binding is defined in `wrangler.jsonc`
- Local auth database is created and available to the Worker runtime
- Any required auth secrets or environment values are configured for local execution
- `README.md` contains the canonical setup steps for provisioning D1 and configuring any additional backend auth services

## Setup Reference

1. Follow `README.md` to create or bind the local auth database.
2. Follow `README.md` to configure any auth-related Worker bindings or secrets.
3. Confirm local development and staging configuration use matching auth binding names before testing the flows below.

## Scenario 1: Register a new account with a passkey

1. Start the app locally with the configured Worker bindings.
2. Open the sign-up flow.
3. Enter a new identifier and begin passkey registration.
4. Complete the browser/device passkey ceremony.
5. Confirm:
   - The account is created
   - A passkey credential is stored for that account
   - An authenticated session is returned
   - A follow-up current-session request returns the same user

## Scenario 2: Sign in with a previously registered passkey

1. Start from a signed-out state.
2. Open the login flow.
3. Begin passkey sign-in for an existing account.
4. Complete the browser/device passkey ceremony.
5. Confirm:
   - Sign-in succeeds on the first valid attempt
   - A new authenticated session is created
   - Refreshing or navigating still shows authenticated state

## Scenario 3: Reject invalid or expired auth ceremonies

1. Begin registration or sign-in to obtain a challenge.
2. Allow the challenge to expire or submit an invalid ceremony response.
3. Confirm:
   - The backend returns a failure outcome
   - No authenticated session is created
   - The client is guided to retry with a fresh ceremony

## Scenario 4: Sign out and invalidate the session

1. Sign in successfully.
2. Trigger sign-out.
3. Confirm:
   - The current session is invalidated
   - A later session lookup returns unauthenticated
   - Protected account state is no longer restored until the user signs in again
