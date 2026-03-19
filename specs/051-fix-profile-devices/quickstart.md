# Quickstart: Profile Device List Visibility

## Goal

Verify that `/profile` shows the authenticated user’s registered devices on first load and no longer presents a silent blank Devices section.

## Prerequisites

- Install dependencies with `npm install`.
- Use an account that already has at least one registered device.

## Manual Verification

1. Start the app with `npm start`.
2. Sign in with an account that has a registered device.
3. Navigate to `http://127.0.0.1:8888/profile` or the local Vite profile route.
4. Confirm the `Devices` section shows at least one device on first load.
5. Confirm the current device is labeled when the session includes a matching current device.
6. Confirm the section does not appear as a blank gap during loading failures or genuine empty results.

## Automated Verification

1. Run targeted tests covering client-state sequencing and device visibility:

   ```bash
   npm test -- test/state-polling.spec.ts test/integration.spec.ts
   ```

2. Run the full validation suite before completing implementation:

   ```bash
   npm run lint
   npm test
   ```

## Expected Outcomes

- The Devices section loads without requiring refresh or secondary navigation.
- The current device is visible when present in the returned device list.
- Empty and error cases are explicit and distinguishable from each other.
