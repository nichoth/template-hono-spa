# Quickstart: Dedicated Signup Route

## Goal

Verify that sign-in and account-creation live on separate routes while sharing the same radio-selector pattern.

## Prerequisites

- Install dependencies with `npm install`
- Start the app with `npm start`
- Use a local environment with the existing auth backend configured

## Scenario 1: Reach signup from login

1. Open `/login`.
2. Confirm the page presents sign-in actions only for both passkey and password methods.
3. Confirm a visible create-account link appears near the primary sign-in action.
4. Select the link and verify navigation to `/signup`.

## Scenario 2: Direct navigation to signup

1. Open `/signup` directly in the browser.
2. Confirm the create-account screen renders without first visiting `/login`.
3. Confirm the method selector matches the login route’s radio-button pattern.

## Scenario 3: Passkey account creation route

1. On `/signup`, keep or switch the selector to passkey.
2. Enter the required identifier and account-creation fields.
3. Trigger the create-account action.
4. Confirm the frontend uses the registration path rather than the login path.
5. Confirm the resulting message describes account creation rather than sign-in.

## Scenario 4: State separation between routes

1. Switch `/signup` between password and passkey.
2. Confirm the visible controls change immediately with the selected option.
3. On the password path, confirm the create-account button remains account-creation-specific and does not sign the user in.
3. Return to `/login`.
4. Confirm `/login` still shows sign-in-only actions and no inline create-account button.
