# Quickstart: Device Invite Link

## Scenario 1: Happy Path — Add a Device via Invitation

**Actors**: Alice (existing device), Bob (new device)

1. Alice logs in on her phone and navigates to `/profile`.
2. Alice types "Work Laptop" in the device name input
   and clicks "Add device".
3. The profile page shows an invitation URL like
   `https://example.com/alice/add/482901` with a copy
   button.
4. Alice copies the link and sends it to herself (email,
   messaging app, etc.).
5. Alice opens the link on her work laptop browser.
6. The laptop shows a page saying "Register this device
   for alice's account" and prompts the WebAuthn
   registration ceremony.
7. Alice completes the passkey prompt on the laptop.
8. The laptop shows "Device added successfully."
9. Alice refreshes her profile on her phone — "Work
   Laptop" now appears in her device list.
10. Alice can now log in from her work laptop using
    the passkey.

## Scenario 2: Expired Invitation

1. Alice generates an invitation link from `/profile`.
2. She doesn't open it for 20 minutes (past the 15-min
   expiry window).
3. When she finally visits the link on the new device,
   the page displays: "This invitation has expired.
   Please generate a new one from your profile."

## Scenario 3: Cancel a Pending Invitation

1. Alice generates an invitation link.
2. She changes her mind and clicks "Cancel" next to the
   pending invitation on her profile page.
3. The pending invitation disappears from her profile.
4. If anyone visits the link now, they see:
   "This invitation is no longer valid."

## Scenario 4: Invitation Already Used

1. Alice generates an invitation and opens it on her
   laptop, successfully registering.
2. Later, someone (or Alice herself) opens the same
   link again.
3. The page shows: "This invitation has already been
   used."

## Scenario 5: Device Limit Reached

1. Alice already has 10 active devices registered.
2. She tries to click "Add device" on her profile.
3. The system shows an error: "You have reached the
   maximum number of devices (10)."
4. No invitation is generated.

## Scenario 6: Failed WebAuthn Ceremony (Retry)

1. Alice opens the invitation link on her new device.
2. The WebAuthn prompt appears but she accidentally
   cancels it.
3. The page shows an error but offers a "Try again"
   button.
4. She clicks "Try again" and completes the ceremony
   successfully.
5. The device is registered.
