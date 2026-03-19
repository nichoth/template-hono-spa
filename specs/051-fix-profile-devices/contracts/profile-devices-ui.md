# Contract: Profile Devices UI

## Surface

`/profile`

## Purpose

Shows the user which registered devices belong to their account and identifies the current device.

## Rendering Rules

- When device management is available for the authenticated session, the page shows a `Devices` section.
- While the device request is pending, the section shows a loading message.
- When the request succeeds with one or more devices, the section shows the device list.
- When the request succeeds with zero devices, the section shows an explicit empty-state message.
- When the request fails, the section shows an explicit error message.
- Pending invitations and add-device controls must not suppress the registered-device list.

## Device List Item Rules

- Each visible device shows a display name or fallback unnamed label.
- Revoked devices remain visibly marked as revoked.
- If a device’s `deviceId` matches the authenticated session’s `currentDeviceId`, that item shows the current-device indicator.

## Non-Goals For This Feature

- No changes to invite creation, invite claiming, or revoke business rules.
- No changes to the auth session payload beyond what is required to preserve current-device visibility.
